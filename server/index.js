import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pool from "./db.js"

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

const PORT= process.env.PORT || 4000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

