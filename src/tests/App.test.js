import { mount } from '@vue/test-utils';
import App from '../App.vue';
import { describe, it, expect, vi } from 'vitest';

const wait = async () => {
    return new Promise((resolve, reject) =>
        setTimeout(() => {
            resolve(true);
        }, 1000)
    );
};
describe('test todos project wtth query', async () => {
    const form = {
        userId: 7,
        completed: false,
    };
    let wrapper;

    beforeAll(async () => {
        window.history.pushState(
            {},
            '',
            `?userId=${form.userId}&completed=${form.completed}`
        );
        wrapper = mount(App);
        await wait();
    });

    it('init state with query', async () => {
        expect(wrapper.vm.form.userId).toEqual(7);
        expect(wrapper.vm.form.completed).not.toBeTruthy();
    });

    it('check form variable changing accordingly to query', async () => {
        // change form values
        const newUserId = 8;
        const select = wrapper.find('select');
        await select.setValue(newUserId);

        let currentUrl = new URL(window.location.href);

        let userId = currentUrl.searchParams.get('userId');
        let completed = currentUrl.searchParams.get('completed');

        expect(userId).toBe(String(newUserId));
        expect(completed).toBe(String(form.completed));

        const newCompletedValue = !form.completed;
        const checkbox = wrapper.find('input[type="checkbox"]');
        await checkbox.setChecked(newCompletedValue);
        
        currentUrl = new URL(window.location.href);
        userId = currentUrl.searchParams.get('userId');
        completed = currentUrl.searchParams.get('completed');

        expect(userId).toBe(String(newUserId));
        expect(completed).toBe(String(newCompletedValue));
    });
});

describe('test todos project without query', async () => {
    let wrapper;

    beforeAll(async () => {
        wrapper = mount(App);
        await wait();
    });

    it(`init state`, async () => {
        // lets fetch todos list elements
        const response = await fetch(
            `https://jsonplaceholder.typicode.com/todos`
        );

        expect(response.ok).toBeTruthy();
        const initList = await response.json();
        // list length to be equat to list from root service
        expect(wrapper.vm.initList.length).toEqual(initList.length);
        expect(
            wrapper.vm.initList.every(
                (el, index) => el.id === initList[index].id
            )
        ).toBeTruthy();
    });

    it('filter by a completed input', async () => {
        // set checked
        const checkbox = wrapper.find('input[type="checkbox"]');
        await checkbox.setChecked();
        
        expect(wrapper.vm.form.completed).toBeTruthy();
        expect(wrapper.vm.todos.every((el) => !!el.completed)).toBeTruthy();

        // set unchecked
        await checkbox.setChecked(false);
        expect(wrapper.vm.form.completed).not.toBeTruthy();
        expect(wrapper.vm.todos.every((el) => !el.completed)).toBeTruthy();
    });

    it('filter by a user', async () => {
        const select = wrapper.find('select');

        // get list of all users
        const responseUsers = await fetch(
            'https://jsonplaceholder.typicode.com/users'
        );
        expect(responseUsers.ok).toBeTruthy();
        const users = await responseUsers.json();

        // get all option
        const options = wrapper.vm.userOptions;
        await select.setValue(options[0].userId);
        const userName = users.find((u) => u.id === options[0].userId)?.name;

        // check all list to be with selected users
        expect(
            wrapper.vm.todos.every(
                (td) => td.userId === options[0].userId && td.name === userName
            )
        ).toBeTruthy();

        // test with another user with random index
        const randomIndex = Math.floor(Math.random() * options.length);
        await select.setValue(options[randomIndex].userId);
        const randomUserName = users.find(
            (u) => u.id === options[randomIndex].userId
        )?.name;

        expect(
            wrapper.vm.todos.every(
                (td) =>
                    td.userId === options[randomIndex].userId &&
                    td.name === randomUserName
            )
        ).toBeTruthy();
    });

});
