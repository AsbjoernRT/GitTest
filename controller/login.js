import index from '../index.js'
import bcrypt from 'bcryptjs'

export const renderLogin = async (req, res) => {
    console.log(req.session);
    if (req.session.loggedin) {
        // res.redirect('/');
        console.log("login Succes");
        res.redirect('./');
    } else {
        console.log("not logged in")
        res.sendFile('login.html', { root: './views' })
    }
}


export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Req.body received:", req.body);



    // Try to fetch the user by email
    const user = await index.connectedDatabase.getUserByMail(email);
    console.log(user);

    if (!user) {
        // If no user is found with that email
        console.log("No user with that email");
        res.redirect('/login?usernotfound');

    }

    else {
        const storedHashedPassword = user.password;

        // Compare the provided password with the stored hashed password
        const pswcheck = await bcrypt.compare(password, storedHashedPassword);

        if (pswcheck) {
            console.log("User found - login success");
            console.log("Provided pswd: " + password, "Excisting pswd: " + user.password);
            req.session.loggedin = true;
            console.log("session saved: " + req.session.loggedin);
            req.session.user = user;
            console.log("session user data: ", req.session.user);

            res.redirect('../?login=success')
        } else {
            console.log("Wrong password");
            const email = req.body.email; // Assuming you have access to the email entered by the user
            res.redirect(`/login?wrongpassword&email=${encodeURIComponent(email)}`);
        }

    }
};

