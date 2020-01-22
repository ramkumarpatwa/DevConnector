//handle json web token for authentication

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const config = require('config');
const { check, validationResult } = require('express-validator/check'); //express validator for making name mandaotory , email type email and password length minimum six
const User = require('../../models/User'); //calling usre model

//@route   GET api/auth
//@desc    Test route
//@access  Public
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); //print everything except password
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}); //just add auth middleware to authorize the route

//@route   POST api/auth
//@desc    Authenticate user & get token
//@access  Public
router.post(
  '/',
  [
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //if above errors variable is not empty then it means we have error
      return res.status(400).json({ errors: errors.array() }); //Bad request meaning server will not process request
    }

    const { email, password } = req.body;

    try {
      //See if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invlaid credential' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password); //compare method is in bcryptjs which compare password enterd by user with password from db

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid credential' }] });
      }
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 3600000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error'); //Server error
    }
  }
);
module.exports = router;
