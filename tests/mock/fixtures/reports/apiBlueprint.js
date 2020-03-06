export const  createUser = `FORMAT: 1A

    # Group Users

    ## create user [POST /users]

    + Request

    {
        "first_name": "Pascal",
        "last_name": "Ancell",
        "email": "pancell1@gravatar.com",
        "gender": "Male"
    }

    + Response 200 (application/json)


    + Headers

        x-powered-by: Express
        content-length: 120

    + Body

    {
        "id": 2,
        "first_name": "Pascal",
        "last_name": "Ancell",
        "email": "pancell1@gravatar.com",
        "gender": "Male"
    }`;
