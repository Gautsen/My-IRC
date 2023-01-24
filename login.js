function login() {
    const command = ["-u -p"];
    switch (command)
    {
        case "-u -p":
            console.log("Username: ");
            break;
        case "-p":
            console.log("Password: ");
            break;
        default:
            console.log("Command not found");
            

}
}
login();
