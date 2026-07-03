import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pool from "./db.js"
import bcrypt from "bcrypt"

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
        res.status(500).json({error:"registration failed"})
        
    }
})

const PORT= process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

