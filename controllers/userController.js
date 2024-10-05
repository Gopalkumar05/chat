const User = require('../models/userModel');
const Chat=require('../models/chatModel')
const bcrypt = require('bcrypt');

const registerLoad = async (req, res) => {
    try {
        res.render('register')

    } catch (error) {
        console.log(error.message);
    }

};
const register = async (req, res) => {
    // console.log(req.file); // Check what this outputs
    // console.log(req.body);
    if (!req.file) {
        console.log("No file uploaded.");
        return res.render('register', { message: 'Please upload an image.' });
    }

    try {
        const passwordHash = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            image: 'images/' + req.file.filename, // This should now work
            password: passwordHash,
        });

        await user.save();
        req.session.user = user;
        res.redirect('/profile');

        // res.render('register', { message: 'Your registration has been completed!' });

    } catch (error) {
        console.log(error.message);
        res.render('register', { message: 'Registration failed, please try again.' });
    }
};


const loginLoad = async (req, res) => {
    try {
        res.render('login');
    } catch (error) {
        console.log(error.message);
    }


}
const login = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;
        const user = await User.findOne({ email: email });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                req.session.user = user;
                res.redirect('/profile');
            } else {
                res.render('login', { message: 'Invalid Email or Password' })
            }
        }
        else {
            res.render('login', { message: 'Invalid Email or Password' })
        }



    } catch (error) {
        console.log(error.message);
    }


}

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/login');
    } catch (error) {
        console.log(error.message);
    }


}


const profile = async (req, res) => {
    try {
        var users = await User.find({ _id: { $nin: [req.session.user._id] } });
        res.render('profile', { user: req.session.user, users: users });
    } catch (error) {
        console.log(error.message);
    }


}

const saveChat = async (req, res) => {
    try {
        const chat = new Chat({
            sender_id: req.body.sender_id,
            receiver_id: req.body.receiver_id,
            message: req.body.message,
        });

        const newChat = await chat.save();
        res.status(200).send({ success: true, msg: 'Chat inserted!', data: newChat });
    } catch (error) {
        console.log(error.message);
        res.status(400).send({ success: false, msg: error.message });
    }
};


module.exports = {
    registerLoad,
    register,
    loginLoad,
    login,
    logout,
    profile,
    saveChat

};