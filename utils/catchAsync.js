/* 
This function is meant to catch async promise rejection 
And call next so the error API and error middleware will take care of the rejection
The function return an anonimous function that will execute the code from the upwards controller
the goal of this solution is to get rid of try / catch blocks for better readability of the controllers 
*/
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
