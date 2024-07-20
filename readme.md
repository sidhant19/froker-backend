# Froker Backed Assignment
## Test API 
A user can test the API at the given endpoint with dummy data.
#### Endpoint:-

``
http://3.82.144.226:4000/user
``

#### Test Data:-
``
POST http://3.82.144.226:4000/user/signup
``

```json
{
  "phoneNumber": "1234567890",
  "email": "abc@lmn.com",
  "name": "ghi jkl",
  "dateOfRegistration": "2024-07-21T00:00:00.000Z",
  "dob": "2000-01-01T00:00:00.000Z",
  "monthlySalary": 300000,
  "password": "password123"
}
```
#### Result:
![Screenshot from 2024-07-21 04-08-25](https://github.com/user-attachments/assets/31787e34-2990-4772-9efd-f97b73b2c7ab)

``
POST http://3.82.144.226:4000/user/login
``

```json
{
  "email": "abc@lmn.com",
  "password": "password123"
}
```
#### Result:
![Screenshot from 2024-07-21 04-09-00](https://github.com/user-attachments/assets/bcecf292-28fb-4a00-9a83-9e1bc3d858de)

``
GET http://3.82.144.226:4000/user/
``

``
Authorization: Bearer <Token>
``
#### Result:
![Screenshot from 2024-07-21 04-09-55](https://github.com/user-attachments/assets/c609950a-c3b7-4e85-9630-bd9fc16aff9d)

``
POST http://3.82.144.226:4000/user/borrow
``

```json
{
  "amount": 200000
}
```
#### Result:
![Screenshot from 2024-07-21 04-11-27](https://github.com/user-attachments/assets/00fdbb9e-be52-40a9-a31d-00c9a973db79)


## Deployment
Deployed using docker on an AWS EC2 Instance



