<script setup lang="ts">
import { ref, onMounted, watch } from "vue"

const readQuery = () => {
  const currentUrl = new URL(window.location.href);

  const userId = currentUrl.searchParams.get('userId') ?? null;
  const completed = currentUrl.searchParams.get('completed') ?? null;

  return {
    userId: userId != null ? Number(userId) : null,
    completed: completed != null ? (completed === 'false' ? false : true) : null 
  }
}
const todos = ref<{ userId: number, id: number; title: string; name: string, completed: boolean }[]>([]);
// const initList = ref<typeof todos.value>([]);
const form = ref<{ userId: number | null; completed: boolean | null }>(readQuery());
const userOptions = ref<{ userId: number; name: string }[]>([]);

const fetchUsers = async (init: boolean = true) => {
  const hostname = `https://jsonplaceholder.typicode.com`
  
  const { userId, completed } = form.value;
  
  if (init) {
    // for to fetching only once at init with all needed values

    // lets call axios request
    const responseUsers = await fetch(`${hostname}/users`);

    if (responseUsers.ok) {
      const fetchUsers = await responseUsers.json() as {
        id: number,
        name: string
      }[];

      // fill user options state
      userOptions.value = fetchUsers.map(u => ({ userId: u.id, name: u.name }));
    }
  }
  const responseTodos = await fetch((() => {
    const url = new URL(`${hostname}/todos`);
    Object.entries({ userId, completed }).forEach(([key, value]) => {
      if (value != null) {
        url.searchParams.set(key, String(value))
      } else {
        url.searchParams.delete(key)
      }
    })

    return url.toString()
  })());

  if (userOptions.value.length && responseTodos) {

    const fetchTodos = await responseTodos.json() as {
      id: number,
      userId: number,
      completed: boolean,
      title: string,
    }[]

    // lets groups users by their id and fill todos list with their name
    const groupedUsers = userOptions.value.reduce<Record<number, typeof userOptions.value[0]>>((acc, curr) => {
      acc[curr.userId] = curr;

      return acc;
    }, {})

    // lets map users with completed true
    const mapUsers = fetchTodos.map(i => ({ ...i, name: groupedUsers[i.userId]?.name ?? '' }))

    todos.value = mapUsers;
  }
}

const setQueryParams = () => {
  const { userId, completed } = form.value;
  const currentUrl = new URL(window.location.href);

  if (userId != null) { 
    currentUrl.searchParams.set('userId', String(userId));
  } else {
    currentUrl.searchParams.delete('userId')
  }

  if(completed != null) {
    currentUrl.searchParams.set('completed', String(completed))
  } else {
    currentUrl.searchParams.delete('completed')
  }
 
  window.history.pushState({}, '', currentUrl)
}

const resetForm = async () => {
  form.value = {
    userId: null,
    completed: null
  }
  
  setQueryParams();
  await fetchUsers(false);
}
// at first mounting of component => lets fetch users
onMounted(fetchUsers);

watch(form, async (newValue, oldValue) => {
  // fetch again user => but with new form parameters
  await fetchUsers(false);
  // lets set apart our query
  setQueryParams()
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
          <option v-for="user in userOptions" :value="user.userId" :key="user.userId">{{ user.name }}</option>
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
