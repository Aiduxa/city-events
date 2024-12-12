const express = require("express")
const mysql = require("promise-mysql")

const jwt = require("jsonwebtoken")
const very_secret_key = "paslaptingasis_raktas"
const bcrypt = require("bcrypt")
const saltrounds = 10



const app = express()
app.use(express.json())

const getDbConnection = async () => {
    return await mysql.createConnection({
        host: "localhost",
        database: "cityevents",
        user: "root"
    })
}

const createUser = async (email, username, password, token) => {
    const db = await getDbConnection()

    await db.query("INSERT INTO users (username, email, password, token) VALUES (?, ?, ?, ?)", [username, email, password, token], (err, res, fields) => {
        console.log("err", err)
        console.log("res", res)
        console.log("fields", fields)
    })
    await db.commit()
    await db.end()
}

const port = 3001

app.listen(port, () => {
    console.log("Started listening at port:", port)
})

app.get("/status", (req, resp) => {
    const db_connection = async () => {
        const db = await getDbConnection()
        const result = await db.query("SELECT * FROM roles")
        await db.end()
        console.log(result)
        return result.length > 0 ? true : false
    }

    const status = {
        "status": "online",
        "database": db_connection() ? "online" : "offline"
    };

    resp.send(status)
})

app.post("/auth/register", (req, resp) => {
    console.log(req.body)
    if (req.body.hasOwnProperty("email") && req.body.hasOwnProperty("password") && req.body.hasOwnProperty("username")) {
        const email = req.body.email
        const username = req.body.username
        const password = req.body.password
        let hashed_pw;
        bcrypt.genSalt(saltrounds, (err, salt) => {
            if (err) {
                console.log(err)
                return;
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    console.log(err)
                    return;
                }
                console.log("hashed pw", hash)
                const payload = {
                    email: email,
                    username: username,
                    hashed_password: hash
                }
                const token = jwt.sign(payload, very_secret_key)
    
                createUser(email, username, hash, token)
                resp.status(200)
                resp.send({"message": "Jūs sėkmingai prisiregistravote.", "token": token})
            })    
        })
        
    } else {
        resp.status(401)
        resp.send({"error": "Privalote užpildyti visus laukelius!"})
    }
})

app.post("/auth/login", (req, resp) => {
    if (req.body.hasOwnProperty("email") && req.body.hasOwnProperty("password")) {
        const email = req.body.email;
        const password = req.body.password;

        

        const getUserByEmailAndCompare = async (email) => {
            const db = await getDbConnection()
            const result = await db.query("SELECT * FROM users WHERE email = ?", email)
            console.log(result[0])
            const user = result[0]    
            await db.end()

            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) throw err;
                    if (result === true) {
                        resp.status(200)
                        resp.send({"message": "Jūs sėkmingai prisijungėte.", "token": user.token})
                    } else {
                        resp.send({message: "Neteisingas slaptažodis"})
                    }
                })
            } else {
                resp.status(404)
                resp.send({message: "Neteisingas el. paštas"})
            }
        }
        getUserByEmailAndCompare(email)
    } 
})

app.get("/events", (req, resp) => {
    const getValidEvents = async () => {
        const db = await getDbConnection()
        const result = await db.query("SELECT * FROM events WHERE approved = true")

        const events = result

        if (events) {
            resp.send(events)
        } else {
            resp.status(200)
            resp.send({message: "Šiuo metu nėra patvirtintų renginių."})
        }
    }
    getValidEvents()
})

app.post("/user/events", (req, resp) => {
    if (req.body.hasOwnProperty("token")) {
        const token = req.body.token

        const validateToken = async () => {
            const db = await getDbConnection()
            const result = await db.query("SELECT * FROM users WHERE token = ?", [token])
            const user = result[0]
            console.log(user)
            if (user) {
                const result = await db.query("SELECT * FROM events WHERE manager = ?", [user.id])
                const events = result
                if (events) {
                    resp.status(200)
                    resp.send({message: "Renginiai rasti", events: events})
                } else {
                    resp.status(200)
                    resp.send({message: "Nerasta renginių."})
                }
            }
        }
        validateToken()
        } else {
        resp.status(404)
        resp.send({message: "Prašome prisijungti."})
    }
})

app.post("/events/create", (req, resp) => {
    if (req.body.hasOwnProperty("token")) {
        const token = req.body.token

        const validateToken = async () => {
            const db = await getDbConnection()
            const result = await db.query("SELECT * FROM users WHERE token = ?", [token])
            const user = result[0]
            console.log(user)
            if (user) {
                if (req.body.hasOwnProperty("title") && req.body.hasOwnProperty("description") && req.body.hasOwnProperty("happening_at") && req.body.hasOwnProperty("location")) {
                    const title = req.body.title;
                    const description = req.body.description;
                    const happening_at = req.body.happening_at;
                    const location = req.body.location;
                    
                    const result = await db.query("INSERT INTO events (title, description, happening_at, location, manager) VALUES (?, ?, ?, ?, ?)", [title, description, happening_at, location, user.id])
                    resp.status(200)
                    resp.send({message: "Renginys sukurtas"})
                
            } else {
                resp.status(400)
                resp.send({message: "Prašome užpildyti visus laukelius."})
            }}
        }
        validateToken()
        } else {
        resp.status(404)
        resp.send({message: "Prašome prisijungti."})
    }
})
app.delete("/events/delete", (req, resp) => {
    if (req.body.hasOwnProperty("token")) {
        const token = req.body.token

        const validateToken = async () => {
            const db = await getDbConnection()
            const result = await db.query("SELECT * FROM users WHERE token = ?", [token])
            const user = result[0]
            console.log(user)
            if (user) {
                if (req.body.hasOwnProperty("id")) {
                    const id = req.body.id
                    
                    const result = await db.query("SELECT * FROM events WHERE id = ?", id)
                    if (result[0]) {
                        if (result[0].manager === user.id || user.role === 1) {
                            await db.query("DELETE FROM events WHERE id = ?", id)
                            resp.status(200)
                            resp.send({message: "Renginys ištrintas"})
                        } else {
                            
                        }
                    } else {
                        resp.status(400)
                        resp.send({message: "Renginys neegzistuoja"})
                    }
                }
            } else {
                resp.status(404)
                resp.send({message: "Prašome prisijungti"})
            }
            await db.end()
        }
        validateToken()
    } else {
        resp.status(404)
        resp.send({message: "Prašome prisijungti."})
    }
})
app.put("/events/edit", (req, resp) => { 
    if (req.body.hasOwnProperty("token")) {
        const token = req.body.token

        const validateToken = async () => {
            const db = await getDbConnection()
            const result = await db.query("SELECT * FROM users WHERE token = ?", [token])
            const user = result[0]
            console.log(1)
            if (user) {
                if (req.body.hasOwnProperty("id") && req.body.hasOwnProperty("title") && req.body.hasOwnProperty("description") && req.body.hasOwnProperty("location") && req.body.hasOwnProperty("happening_at") && req.body.hasOwnProperty("photos")) {
                    const id = req.body.id
                    console.log(user)
                    console.log(1)
                    
                    const result = await db.query("SELECT * FROM events WHERE id = ?", id)
                    const event = result[0]
                    if (event) {
                        console.log(event)

                        const title = event.title == req.body.title ? event.title : req.body.title;
                        const description = event.description == req.body.description ? event.description : req.body.description;
                        const location = event.location == req.body.location ? event.location : req.body.location;
                        const happening_at = event.happening_at == req.body.happening_at ? event.happening_at : req.body.happening_at;
                        const photos = event.photos == req.body.photos ? event.photos : req.body.photos;

                        
                        if (event.manager === user.id || user.role === 1) {
                            await db.query("UPDATE events SET title = ?, description = ?, location = ?, happening_at = ?, photos = ? WHERE id = ?", [title, description, location, happening_at, photos, event.id])
                            resp.status(200)
                            resp.send({message: "Renginys atnaujintas"})
                        } else {
                           resp.status(300)
                           resp.send({message: "Negalima"}) 
                        }
                    } else {
                        resp.status(400)
                        resp.send({message: "Renginys neegzistuoja"})
                    }
                } else {
                    resp.status(404)
                    resp.send({message: "Įvyko klaida"})
                }
            } else {
                resp.status(404)
                resp.send({message: "Prašome prisijungti"})
            }
            await db.end()
        }
        validateToken()
    } else {
        resp.status(404)
        resp.send({message: "Prašome prisijungti."})
    }
})
app.put("/events/rate", (req, resp) => {
    if (req.body.hasOwnProperty("token")) {
        const token = req.body.token

        const validateToken = async () => {
            const db = await getDbConnection()
            const result = await db.query("SELECT * FROM users WHERE token = ?", [token])
            const user = result[0]
            console.log(user)
            if (user) {
                if (req.body.hasOwnProperty("id") && req.body.hasOwnProperty("rating")) {
                    const id = req.body.id
                    const rating = req.body.rating
                    
                    const result = await db.query("SELECT * FROM events WHERE id = ?", id)
                    const event = result[0]
                    if (event) {
                        if (0 < rating && rating <= 5) {
                            console.log("ratings ", event.ratings)
                            
                            const ratings = JSON.parse(event.ratings)

                            ratings[user.token] = rating 

                            await db.query("UPDATE events SET ratings = ? WHERE id = ?", [JSON.stringify(ratings), event.id])

                            resp.status(200)
                            resp.send({message: "Renginys įvertintas"})
                        } else {
                            resp.status(400)
                            resp.send({message: "Netinkantis vertinimas"})
                        }
                    } else {
                        resp.status(400)
                        resp.send({message: "Renginys neegzistuoja"})
                    }
                }
            } else {
                resp.status(404)
                resp.send({message: "Prašome prisijungti"})
            }
            await db.end()
        }
        validateToken()
    } else {
        resp.status(404)
        resp.send({message: "Prašome prisijungti."})
    }
})

app.get("/admin/users", (req, resp) => {
    
})

app.put("/admin/events/approve", (req, resp) => {
    if (req.body.hasOwnProperty("token")) {
        const token = req.body.token

        const validateToken = async () => {
            const db = await getDbConnection()
            const result = await db.query("SELECT * FROM users WHERE token = ?", [token])
            const user = result[0]
            console.log(user)
            if (user) {
                if (req.body.hasOwnProperty("id")) {
                    const id = req.body.id
                    const rating = req.body.rating
                    
                    const result = await db.query("SELECT * FROM events WHERE id = ?", id)
                    const event = result[0]
                    if (event) {
                        if (user.role === 1) {

                            await db.query("UPDATE events SET approved = ? WHERE id = ?", [true, event.id])

                            resp.status(200)
                            resp.send({message: "Renginys patvirtintas"})
                        } else {
                            resp.status(400)
                            resp.send({message: "Neužtenka privilegijų"})
                        }
                    } else {
                        resp.status(400)
                        resp.send({message: "Renginys neegzistuoja"})
                    }
                }
            } else {
                resp.status(404)
                resp.send({message: "Prašome prisijungti"})
            }
            await db.end()
        }
        validateToken()
    } else {
        resp.status(404)
        resp.send({message: "Prašome prisijungti."})
    }
})