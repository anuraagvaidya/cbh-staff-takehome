import test from 'ava';
import axios from 'axios';
import { App } from '../dist/index.js';

const baseURL = `http://localhost:${process.env.port || 3000}`
let token = null;
test.before(async ()=>{
    const app = new App();
    await app.start();
});
test.serial('Logging in as an *invalid* user', async t => {
    let response = await axios.post(`${baseURL}/api/user/login`, {email: 'dummy', password:'dummy'}, {
        validateStatus: false
    })
    if(response.status !== 200){
        t.pass();
    }
    else{
        t.fail();
    }
});

test.serial('Logging in as a *valid* user', async t => {
    let response = await axios.post(`${baseURL}/api/user/login`, {email: 'dummy@clipboardhealth.com', password:'dummy'}, {
        validateStatus: false
    });
    if(response.status === 200 && response?.data?.data?.token){
        token = response.data.data.token;
        t.pass();
    }
    else{
        t.fail();
    }
});

test.serial('Adding a new salary record', async t => {
    let resp = await axios.post(`${baseURL}/api/salary/add-new-record`, {
        "name":"test 1",
        "salary":"20000",
        "currency":"USD",
        "department":"Engineering",
        "sub_department":"1"
    }, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: false,
    });
    if(resp.status === 200 && t.truthy(resp?.data?.data?.insertedId)){
        t.pass();
    }
    else{
        t.fail();
    }
});

test.serial('Adding more records', async t => {
    let insertRecord = async (record)=>{
        let resp = await axios.post(`${baseURL}/api/salary/add-new-record`, record, {
            headers: {
                authorization: `Bearer ${token}`
            },
            validateStatus: false,
        });
        if(!(resp.status === 200 && t.truthy(resp?.data?.data?.insertedId))){
            t.fail();
        }
        else{
            return true;
        }
    }
    await insertRecord({
        "name":"test 2",
        "salary":"10000",
        "currency":"USD",
        "department":"Engineering",
        "sub_department":"Frontend"
    });
    await insertRecord({
        "name":"test 3",
        "salary":"20000",
        "currency":"USD",
        "department":"Engineering",
        "sub_department":"Backend"
    });
    await insertRecord({
        "name":"test 4",
        "salary":"14500",
        "currency":"USD",
        "department":"Engineering",
        "sub_department":"Backend"
    });
    await insertRecord({
        "name":"Creative 1",
        "salary":"13580",
        "currency":"USD",
        "department":"Creative",
        "sub_department":"Design"
    });
    await insertRecord({
        "name":"Creative 2",
        "salary":"15600",
        "currency":"USD",
        "department":"Creative",
        "sub_department":"Photography"
    });
    await insertRecord({
        "name":"Contracted 1",
        "salary":"10200",
        "currency":"USD",
        "department":"Creative",
        "sub_department":"Design",
        "on_contract":"true"
    });
    await insertRecord({
        "name":"Contracted 2",
        "salary":"5000",
        "currency":"USD",
        "department":"Creative",
        "sub_department":"Photography",
        "on_contract":"true"
    });
    t.pass();
});

test.serial('Deleting a record', async t => {
    let resp = await axios.delete(`${baseURL}/api/salary/delete-record-by-id/asdasd`, {
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: false,
    });
    if(resp.status === 200 && t.deepEqual(resp?.data?.status,"success") && t.true(typeof resp?.data?.data?.deletedRecords!=='undefined')){
        t.pass();
    }
    else{
        t.fail();
    }
});

test.serial('Getting the summary stats of all employees', async t => {
    let resp = await axios.get(`${baseURL}/api/salary/get-summary-statistics-all`,{
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: false,
    });
    if(resp.status === 200 && t.deepEqual(resp?.data?.status,"success") && t.truthy(resp?.data?.data?.min) && t.truthy(resp?.data?.data?.max) && t.truthy(resp?.data?.data?.mean)){
        t.pass();
    }
    else{
        t.fail();
    }
});

test.serial('Getting the summary stats for contractors', async t => {
    let resp = await axios.get(`${baseURL}/api/salary/get-summary-statistics-for-on-contract`,{
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: false,
    });
    if(resp.status === 200 && t.deepEqual(resp?.data?.status,"success") && t.truthy(resp?.data?.data?.min) && t.truthy(resp?.data?.data?.max) && t.truthy(resp?.data?.data?.mean)){
        t.pass();
    }
    else{
        t.fail();
    }
});

test.serial('Getting the summary stats for all departments', async t => {
    let resp = await axios.get(`${baseURL}/api/salary/get-summary-statistics-all-departments`,{
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: false,
    });
    if(resp.status === 200 && t.deepEqual(resp?.data?.status,"success") && t.truthy(resp?.data?.data)){
        for(let department in resp?.data?.data){
            if(!(t.truthy(resp?.data?.data[department]?.max) && t.truthy(resp?.data?.data[department]?.mean))){
                t.fail();
            }
        }
        t.pass();
    }
    else{
        t.fail();
    }
});

test.serial('Getting the summary stats for all sub departments for each department', async t => {
    let resp = await axios.get(`${baseURL}/api/salary/get-summary-statistics-all-sub-departments`,{
        headers: {
            authorization: `Bearer ${token}`
        },
        validateStatus: false,
    });
    if(resp.status === 200 && t.deepEqual(resp?.data?.status,"success") && t.truthy(resp?.data?.data)){
        for(let department in resp?.data?.data){
            if(t.truthy(resp?.data?.data[department])){
                for(let subDepartment in resp?.data?.data[department]){
                    if(!(t.truthy(resp?.data?.data[department][subDepartment]?.max) && t.truthy(resp?.data?.data[department][subDepartment]?.mean))){
                        t.fail();
                    }
                }
            }
        }
        t.pass();
    }
    else{
        t.fail();
    }
});
