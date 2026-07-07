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

function requireAuth(req,res,next){
    const{authorization}=req.headers
    if(!authorization){
        return res.status(401).json({error:"missing token"})
    }

    const token= authorization.split(" ")[1]

    try {

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user=decoded
        next()
        
    } catch (error) {
        console.log(error)
        return res.status(401).json({ error: "invalid or expired token" })

    }
}

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

app.get("/me", requireAuth, (req, res) => {
    res.json({ user: req.user })
})

app.get("/channels",requireAuth,async(req,res)=>{
    try {
        const channels= await pool.query(`select id, name from channels order by created_at `)
        return res.json({ channels: channels.rows })
        
    } catch (error) {

        console.log(error)
        return res.status(500).json({ error: "Failed to fetch channels" });
        
    }
})

app.post("/channels",requireAuth,async(req,res)=>{
    const {name}=req.body
    if(!name){
        return res.status(400).json({error: "missing name of channel"})
    }
    try {
        const channels=await pool.query(`insert into channels(name) values ($1) returning id, name, created_at`,[name])

        return res.status(201).json({channel: channels.rows[0]})
    } catch (error) {
        console.log(error);
        if(error.code==="23505"){
            return res.status(409).json({error: "duplicate channel not creatable"})
        }
        return res.status(500).json({ error: "Failed to create channel" });
    }
})

app.delete("/channels/:id",requireAuth,async(req,res)=>{
    
    try {

        const {id}=req.params
        const result=await pool.query(`delete from channels where id =$1`,[id])

        if(!result.rowCount){
            return res.status(404).json({ error: "Channel not found" });
        }

        return res.status(204).send()
        
    } catch (error) {
        console.log(error)
        if(error.code==="22P02")
        {
            return res.status(404).json({error:"no such channel — an id that can't even be a uuid certainly isn't one"})
        }
        return res.status(500).json({ error: "Failed to delete channel" });
    }
})

const PORT= process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

