import jwt from 'jsonwebtoken';
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '60d',
  });
};

export default generateToken;