const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>{     // u get back the position of array item with findIndex
        return user.id === id
    }) 
    if(index !== -1) {  // that means we find a match
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    // const index = users.findIndex((user)=>{     // u get back the position of array item with findIndex
    //     return user.id === id
    // }) 
    // if(index === -1) {  // that means we could not find a match
    //     return undefined
    // }
    // return users

    /*Refactoring */
    return users.find((user)=> user.id === id)
}

const getUserInRoom = (room) =>{
    // const index = users.findIndex((user)=>{     // u get back the position of array item with findIndex
    //     return user.room === room
    // }) 
    // if(index === -1) {  // that means we could not find a match
    //     return []
    // }
    // return users
    /*Refactoring */
    return users.filter((user)=> user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}