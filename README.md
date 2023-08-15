# REST APIs 
## Users auth endpoints


------------------------------------------------------------------------------------------

#### Creating new/overwriting existing stubs & proxy configs

<details>
 <summary><code>POST</code> <code><b>/</b></code> <code>(overwrites all in-memory stub and/or proxy-config)</code></summary>

##### Parameters

> | name      |  type     | data type               | description                                                           |
> |-----------|-----------|-------------------------|-----------------------------------------------------------------------|
> | username  |  required | object (JSON        )   | N/A  |
> | password  |  required | object (JSON        )   | N/A  |


##### Responses

> | http code     | content-type                      | response                                                            |
> |---------------|-----------------------------------|---------------------------------------------------------------------|
> | `201`         | `text/plain;charset=UTF-8`        | `Configuration created successfully`                                |
> | `400`         | `application/json`                | `{"code":"400","message":"Bad Request"}`                            |
> | `405`         | `text/html;charset=utf-8`         | None                                                                |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/
> ```

</details>

------------------------------------------------------------------------------------------
---
[POST] & [GET] 	*to all /..*
- responce
		_set session cookie in browser_

---
[POST]		*/auth/local/signin*
- request 
```
		body:{
			"username": String, 
			"password": String (>= 8 digits)
		}
```
- responce
1. if *OK*
```
			status: 200
			body: {
				"id": String, 
				"email": String, 
				"firstName": String,	
				"lastName": String,	 
				"source": String,	
				"lastVisited": Date
			}
```
2. if *error*
```
			status: 401
```

---
[POST]		*/auth/local/signup*
- request
		body: {
			"first_name": String,
			"last_name": String,
			"email": String,
		   "password": String
		}
- responce
  1. *OK*
			status: 201
			body: {
				message: "An Email sent to your account please verify"
			}
  2. *error*
   		status: 409
			body: {
				"message": String (error description)
			}

---
[GET]		*/login/facebook*
- responce
	1. *OK*
			status: 200
			body: {
				"id": String,
				"lastVisited": Data,
				"email": string,
				"firstName": String,
				"lastName": String,
				"profilePhoto": String (url),
				"source": String
			}

---
[GET]		*/login/facebook*
- responce
	1. *OK*
			status: 200
			body: {
				"id": String,
				'lastVisited': Data,
				'email': "",
				'firstName': String,
				'lastName': String,
				'profilePhoto': String (url),
				'source': String
			}

---
[GET]		*/auth/logout*
- request

- responce
		status: 200
		body: {
			"success": true
		}
	_with clear cookie in browser_




Bata base structure
	[users] : 
	[cards] : ObjectId, userId, ...data 
	[goodsPicture] : cardId, pictureId
	[coments] : cardId, userId, ...data
	[catecory] : 


<!-- [POST]		*/card*
- request

- responce
		status: 200
		body: {
			"success": true
		}
	_with clear cookie in browser_ -->
