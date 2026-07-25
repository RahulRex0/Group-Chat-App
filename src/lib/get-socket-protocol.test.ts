import {test,expect} from "vitest"
import { getSocketProtocol } from "./get-socket-protocol"


test("returns wss: for https:",()=>{
    expect(getSocketProtocol("https:")).toBe("wss:")
})

test("returns ws: for http:",()=>{
    expect(getSocketProtocol("http:")).toBe("ws:")
})

