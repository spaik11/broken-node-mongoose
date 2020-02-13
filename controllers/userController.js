const User = require('../models/Users');
const bcrypt = require('bcryptjs');

module.exports = {
  register: (req, res) => {
    return new Promise((resolve, reject) => {
      const { name, email, password } = req.body;

      //validate input
      if (
        name.length === 0 ||
        email.length === 0 ||
        password.length === 0
      ) {
        return res.json({ message: 'All fields must be completed' });
      }
      // check if user exists
      User.findOne({ email }).then(user => {
        if (user) {
          return res.status(403).json({ message: 'User Already Exists' });
        }
        const newUser = new User();
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        newUser.name = name;
        newUser.email = email;
        newUser.password = hash;

        newUser
          .save()
          .then(user => {
            return res.status(200).json({ message: 'User Created', user });
          })
          .catch(err => {
            reject(err);
          });
      });
    });
  },

  login: (req, res) => {
    return new Promise((resolve, reject) => {
      User.findOne({ email: req.body.email })
        .then(user => {
            bcrypt.compare(req.body.password, user.password)
            .then(user => {
              return res.send(
                user === true
                  ? 'You are now logged in'
                  : 'Incorrect credentials'
              );
            })
            .catch(err => {
              return res.status(500).json({ message: 'Server error', err });
            });
        })
        .catch(err => reject(err));
    });
  },
  updateProfile: (req, res) => {
    return new Promise((resolve, reject) => {
      User.findById({ _id: req.params.id })
        .then(user => {
          const { name, email } = req.body;

          user.name = name ? name : user.name;
          user.email = email ? email : user.email;

          user
            .save()
            .then(user => {
              return res.status(200).json({ message: 'User Updated', user });
            })
            .catch(err => reject(err));
        })
        .catch(err => res.status(500).json({ message: 'Server Error', err }));
    });
  },

  deleteProfile: (req, res) => {
      return new Promise((resolve, reject) => {
        User.findByIdAndDelete({ _id: req.params.id })
          .then(user => {
            return res.status(200).json({ message: 'User Deleted', user });
          })
          .catch(err => res.status(400).json({ message: 'No User To Delete' }));
      });
  }
};
