
"use server"

import { cookies } from "next/headers";
import api from "./axios.";

export async function fetchTasks() {
 
    const token= cookies().get("access_token")?.value
  try{
    const response = await api.get(`${process.env.NEXT_PUBLIC_Base_URL}/employeetask`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });
      const data_res = await response.data;
      if(response.status==200){
console.log(token)
    return data_res
}
else{
    console.error("Error fetching employees:", data_res);
    
    return null
}
  }catch (error) {
    
    console.error("Error fetching employees:", error);
return null
} 


    }
