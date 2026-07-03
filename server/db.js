import net from "net"
import pg from "pg"
import dotenv from "dotenv"

net.setDefaultAutoSelectFamilyAttemptTimeout(2000)

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export default pool
