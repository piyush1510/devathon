const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
    console.log(req.cookies);
  const token = req.cookies.token
  if (token == null) return res.sendStatus(401);
  jwt.verify(token, process.env.SECRET_KEY, (err, student) => {
    if (err) return res.sendStatus(404);
    req.student = student;
    next();
  });
};


exports.getLogin = (req, res) => {
  res.render("login-student");
};




exports.postLogin = async (req, res) => {
  const { roll, pass } = req.body;
  console.log(req.body);
  try {
    const student = await Student.findOne({ roll });
    // wrong roll number
    if (student == null) throw new Error("wrong email id");
    console.log(student);
    const match = await bcrypt.compare(pass, student.password);
    console.log(match);
    if (match) {
      const token = await jwt.sign(
        { name: student.name, email: student.email, id: student.id },
        process.env.SECRET_KEY
      );
      res.cookie('token',token).redirect("/student/home");
    } else throw new Error("wrong password");
  } catch (err) {
    res.send(err.message);
  }
};
exports.getRegister = (req, res) => {
  res.render("register-student");
};
exports.getDashboard = (req, res) => {
  res.send(req.student);
};
exports.postRegister = async (req, res) => {
  const { email, name, roll, course, branch, pass, cpass, year } = req.body;
  console.log(req.body);
  try {
    const hash = await bcrypt.hash(pass, 10);
    const student = new Student({
      email,
      name,
      roll,
      course,
      dept: branch,
      password: hash,
      year
    });
    await student.save();
    res.render("login-student", { success: true });
  } catch (err) {
    res.send(err);
  }
};
exports.getNotice = (req, res) => {
  res.send(req.params.id);
};
