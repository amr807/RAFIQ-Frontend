"use client";

export async function fetchEmployees(email: string | undefined) {
    if (email=== undefined) {
        console.error("Email is required to fetch employees.");
        return null;
    }
  try{
    const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/employees`, {
        method: "POST",
        body: JSON.stringify({ email: email }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data_res = await response.json();
if(response.status==201){
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
