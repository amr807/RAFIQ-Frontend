export async function fetchImage(email:string) {

const res = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/azure-storge-download`, {
headers: {
        "Content-Type": "application/json",},
body: JSON.stringify({email:email}),
method: "POST",
})

if(res.status===201){
    
    const blob = await res.blob();
    
    return  URL.createObjectURL(blob);

}
else{
    
return null
}

}
