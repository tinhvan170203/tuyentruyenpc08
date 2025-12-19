const Cauhois = require("../models/CauHoi.cjs");
const LichsuThis = require("../models/LichsuThi.cjs");



module.exports = {
  getCauhois: async (req, res) => {
    let { question } = req.query;
    let id = req.params.id; // id môn thi
    try {
      let items = await Cauhois.find({
        question: { $regex: question, $options: "i" }, 
        monthi: id
      }).sort({createdAt: -1})

      res.status(200).json(items)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res
        .status(401)
        .json({
          status: "failed",
          message: "Có lỗi xảy ra khi phía máy chủ. Liên hệ Admin",
        });
    }
  },

  addCauhoi: async (req, res) => {
    let {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      answer,
      monthi
    } = req.body;
    let questionParam = req.body.queryParams.question
    try {
      let newItem = new Cauhois({
        question,
        option_a,
        option_b,
        option_c,
        option_d,
        option_e,
        answer,
        monthi,
        monthiString: monthi
      });
      await newItem.save();

      let items = await Cauhois.find({
        question: { $regex: questionParam, $options: "i" }, 
        monthi
      }).sort({createdAt: -1})

      res.status(200).json({
        status: "success",
        message: "Thêm mới thành công",
        items
      });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra khi thêm mới",
      });
    }
  },
  updatedCauhoi: async (req, res) => {
    let id = req.params.id;
    let questionParam = req.body.queryParams.question;
    let monthi = req.body.monthi;

    let {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      answer
    } = req.body;
    try {
      await Cauhois.findByIdAndUpdate(id, {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      option_e,
      answer
      });

      let items = await Cauhois.find({
        question: { $regex: questionParam, $options: "i" }, 
        monthi
      }).sort({createdAt: -1})

      res.status(200).json({ message: "update thành công" , items});
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message:
          "Có lỗi xảy ra khi điều chỉnh. Vui lòng liên hệ quản trị hệ thống.",
      });
    }
  },
  deleteCauhoi: async (req, res) => {
    let id = req.params.id;
    let { question, monthi } = req.query;
 
    try {
      //check xem có thí sinh nào thi vào câu hỏi đó k trong lịch sử thi
      let checkedLichsuthi = await LichsuThis.findOne({
        "questions.question" : id
      });

      if(checkedLichsuthi !== null){
        const error = new Error('Thao tác xóa thất bại do bài thi của thí sinh có chứa câu hỏi này');
        error.status = 401;
        throw error;
      };

      await Cauhois.findByIdAndDelete(id);
      let items = await Cauhois.find({
        question: { $regex: question, $options: "i" }, 
        monthi
      }).sort({createdAt: -1})
      res.status(200).json({ message: "Xóa thành công", items });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message
      });
    }
  }
};
