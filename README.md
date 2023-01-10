# cbh-staff-takehome

This is my submission to the CBH Staff take-home assignment.

## Running the code
When running, the server will be available at `http://localhost:3000`.

### Using Docker
Run `docker-compose up` in the project root.

### Without Docker
1. Install Node.js 16.13.0 or later
2. Run `npm install` in the project root
3. Run `npm run dev` to start the server

### Dummy user credentials
Email: `dummy@clipboardhealth.com` and password: `dummy`.

## API end-points:
#### Logging in
```
curl --location --request POST 'http://localhost:3000/api/user/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "dummy@clipboardhealth.com",
    "password": "dummy"
}'
```
The above will give you a token, use that in the subsequent requests.

#### Add employee salary records
```
curl --location --request POST 'http://localhost:3000/api/salary/add-new-record' \
--header 'Authorization: Bearer <token_here_>' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "Contracted 2",
    "salary": "5000",
    "currency": "USD",
    "department": "Creative",
    "sub_department": "1",
    "on_contract": "true"
}'
```
#### Get all summary statistics
```
curl --location --request GET 'http://localhost:3000/api/salary/get-summary-statistics-all' \
--header 'Authorization: Bearer <token_here>'
```

#### Get summary statistics for on contract employees
```
curl --location --request GET 'http://localhost:3000/api/salary/get-summary-statistics-for-on-contract' \
--header 'Authorization: Bearer <token_here>'
```

#### Get summary statistics department-wise
```
curl --location --request GET 'http://localhost:3000/api/salary/get-summary-statistics-all-departments' \
--header 'Authorization: Bearer <token_here>'
```

#### Get summary statistics sub-department-wise and department-wise
```
curl --location --request GET 'http://localhost:3000/api/salary/get-summary-statistics-all-sub-departments' \
--header 'Authorization: Bearer <token_here>'
```


## Practices followed
1. Standard-compliant API to maximize interoperability
2. Modular code to maximize reusability and allow in-place replacement
3. Static typing using TypeScript to maximize readability and reduce bugs
4. Using latest features of ECMAScript 2022 to show familiarity with the language

In my opinion, best practices followed change from project to project because there is always a trade-off between delivery time, team size, maintainability, and performance. I come from a startup culture, and hence I believe that the number one priority is always to deliver a working product, and then we can optimize for maintainability and performance. Test coverage also plays an important role, however in an ever-evolving product, frontend code changes quite quickly, so that's a trade-off to consider too.

Writing high quality code often calls for a type-checked language, and I have used TypeScript for this project.

Best,
Anuraag