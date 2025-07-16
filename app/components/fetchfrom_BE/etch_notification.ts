export async function fetchNotificationsFromDB(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/managernotifications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: id }),
  })
  try {
    if (response.status === 201) {
      const data = await response.json()
      return data
    } else {
      throw new Error("Network response was not ok")
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error)
  }
}

export async function UptateNotificationsFromDB(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/managernotifications/id`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
  try {
    if (response.status === 200) {
      return true
    } else {
      throw new Error("Network response was not ok")
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error)
  }
}

export async function UptateAllNotificationsFromDB(id: string[]) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_Base_URL}/managernotifications/all`, {
    method: "PUT",
    
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: id }),
  })
  try {
    if (response.status === 200) {
      return true
    } else {
      throw new Error("Network response was not ok")
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error)
  }
}
