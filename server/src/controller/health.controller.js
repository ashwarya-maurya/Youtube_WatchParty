module.exports.getHealth = async(req, res) =>{
      res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString()
  });
}
