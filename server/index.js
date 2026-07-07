import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pool from "./db.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

dotenv.config()

const app= express()

app.use(cors())
app.use(express.json())

app.get("/",(req,res)=>{
    res.json({message:"express working"})
})

app.get("/health",async(req,res)=>{
   try{
        const result= await pool.query("select now()")
        res.json({
            status:"connected",
            time:result.rows[0].now
        })
   } catch(error)
   {
        console.error(error)
        res.status(500).json({status: "error"})
   }
})

app.post("/register",async(req,res)=>{
    const{email,password}=req.body

    if(!email ||!password){
        return res.status(400).json({error: "email and password needed"})
    }

    try {
        const username= email.split("@")[0]
        const password_hash= await bcrypt.hash(password,10)


        const result = await pool.query(
            `insert into users(username, email, password) values($1,$2,$3) returning id, username, email, created_at`,
            [username, email, password_hash]
        )

        res.status(201).json({ user: result.rows[0] })

    } catch (error) {
        console.log(error)
        if (error.code === "23505") {
            if (error.constraint === "users_email_key") {
                return res.status(409).json({ error: "email already registered"})
            }
            if (error.constraint === "users_username_key") {
                return res.status(409).json({ error: "username already taken"})
            }
        }
        res.status(500).json({error:"registration failed"})
        
    }
})

app.post("/login",async(req,res)=>{
    const {email,password}=req.body

    if(!email ||!password){
        return res.status(400).json({error: "email and password needed"})
    }
    try {

        const result = await pool.query(`select * from users where email= $1`,[email])

        const user = result.rows[0];

        if(!user || !await bcrypt.compare(password,user.password)
        ){
            return res.status(401).json({error: "invalid credentials"})
        }

        const token = jwt.sign(
            { userId: user.id, username: user.username },process.env.JWT_SECRET,{ expiresIn: "7d" }
        )

        res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
        

          
    } catch (error) {
        console.log(error)
        res.status(500).json({error:"login failed"})
    }

})

const PORT= process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

