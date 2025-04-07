<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

const todos = ref<{ userId: number, id: number; title: string; name: string, completed: boolean }[]>([]);
const initList = ref<typeof todos.value>([]);
const form = ref<{ userId: number | null; completed: boolean | null }>({ userId: null, completed: null });
const userOptions = ref<{ userId: number; name: string }[]>([]);

const fetchUsers = async () => {
  const hostname = `https://jsonplaceholder.typicode.com`
  // lets call axios request
  const responseUsers = await fetch(`${hostname}/users`);
  const responseTodos = await fetch(`${hostname}/todos`)

  if (responseUsers && responseTodos) {

    const fetchUsers = await responseUsers.json() as {
      id: number,
      name: string
    }[];

    // fill user options state
    userOptions.value = fetchUsers.map(u => ({ userId: u.id, name: u.name }));

    const fetchTodos = await responseTodos.json() as {
      id: number,
      userId: number,
      completed: boolean,
      title: string,
    }[]

    // lets groups users by their id and fill todos list with their name
    const groupedUsers = fetchUsers.reduce<Record<number, typeof fetchUsers[0]>>((acc, curr) => {
      acc[curr.id] = curr;

      return acc;
    }, {})

    // lets map users with completed true
    const mapUsers = fetchTodos.map(i => ({ ...i, name: groupedUsers[i.userId]?.name ?? '' }))

    initList.value = mapUsers;
    todos.value = initList.value;
  }
}

const filterUsers = () => {
  // lets take in count all filters which we have
  const { userId, completed } = form.value;

  let filteredUsers = initList.value.filter(u => {
    let response = true;
    if (userId) {
      response = u.userId === userId
    }

    if (response && completed != null) {
      response = u.completed === completed;
    }

    return response;

  });

  todos.value = filteredUsers;
}

const resetForm = () => {
  form.value = {
    userId: null,
    completed: null
  }

  todos.value = initList.value;


}
// at first mounting of component => lets fetch users
onMounted(fetchUsers);

watch(form, (newValue, oldValue) => {
  console.log(`trigger filter`);
  // once value is changed vor some of form's keys => lets filter our list
  filterUsers()
}, { deep: true })
</script>

<template>
  <div class="d-flex flex-column" style="min-width: 600px; margin-right: auto; margin-left: auto;">
    <h1 style="text-align: center; width: 100%;"><b>Todo List</b></h1>
    <!-- here should be our filter -->
    <div class="d-flex flex-column" style="padding: 1rem; border: solid 1px white; border-radius: 30px;">
      <div class="d-flex justify-content-around">
        <select v-model="form.userId">
          <option :value="null">Select user</option>
          <option v-for="user in userOptions" :value="user.userId">{{ user.name }}</option>
        </select>
        <div>
          <input type="checkbox" id="filterCompleted" v-model="form.completed" />
          <label style="margin-left: 0.5rem;" for="filterCompleted">Completed</label>
        </div>
      </div>
      <button @click="resetForm" style="background-color: red; align-self: flex-end; color: white;">Reset</button>
    </div>
    <h2><b>List of todos</b></h2>
    <!-- a table with users -->
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Completed</th>
          <th>User</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="todo in todos" :key="todo.id">
          <td>{{ todo.id }}</td>
          <td>{{ todo.title }}</td>
          <td>{{ todo.completed ? `Yes` : `No` }}</td>
          <td>{{ todo.name }}</td>
          <!-- <td>{{ user.title }}</td> -->
        </tr>
      </tbody>
    </table>
  </div>
</template>
<!-- <template>
  <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main>
</template> -->

<style scoped>
/* my styles */
table {
  width: 100%;
  border-collapse: collapse;
  color: white;
}

th,
td {
  border: 1px solid white;
  padding: 8px;
  text-align: left;
}

tbody tr:nth-child(odd) {
  background-color: #2c2c2c;
}

tbody tr:nth-child(even) {
  background-color: #1e1e1e;
}

.d-flex {
  gap: 0.5rem;
  display: flex;
}

.flex-row {
  flex-direction: row;
}

.flex-column {
  flex-direction: column;
}

.justify-content-between {
  justify-content: space-between;
}

.justify-content-around {
  justify-content: space-around;
}

/*  */
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
