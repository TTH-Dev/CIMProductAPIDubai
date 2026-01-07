import catchAsync from "../utils/catchAsync.js";

export const createCall=catchAsync(async(req,res,next)=>{
 
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${"key_c24a82566e34692dcb01ca458906"}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        agent_id: "agent_6b4d02ab76465723dab22797ad"
      })
    });

    const data = await response.json();
    res.json(data);  

})