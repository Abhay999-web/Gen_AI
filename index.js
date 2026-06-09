import "dotenv/config"
import readline from "readline/promises"
import {ChatMistralAI} from '@langchain/mistralai'
import { HumanMessage } from "@langchain/core/messages"
import {tool} from "@langchain/core/tools"
import { createAgent } from "langchain";
import { sendEmail } from "./mail.service.js"
import * as z from "zod";    //for define format



const emailTool = tool(

    sendEmail,               //return string
    {
        name: "emailTool",
        description: "Use this tool to send an email",
        schema: z.object({
            to: z.string().describe("The recipient's email address"),
            html: z.string().describe("The HTML content of the email"),
            subject: z.string().describe("The subject of the email"),

        })
    }
)




const rl = readline.createInterface({ 
  input: process.stdin,
  output: process.stdout
})


const model = new ChatMistralAI({
    model: "mistral-small-latest",
})

const agent = createAgent({
    model,
    tools : [emailTool]
})

const messages = []  //for all chat history

while(true){
    const userInput = await rl.question("You: ") 

    messages.push(new HumanMessage(userInput))

    const response = await agent.invoke({
        messages
    })

    messages.push(response.messages[response.messages.length-1])

    console.log(response.messages[response.messages.length-1].content)
   
}



rl.close()