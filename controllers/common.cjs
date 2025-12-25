
const Donvis = require("../models/Donvi.cjs");
const Monthis = require("../models/Monthi.cjs");
const Cuocthis = require("../models/Cuocthi.cjs");
const Danhsachthisinhs = require("../models/DanhSachThiSinh.cjs");
const Cauhois = require("../models/CauHoi.cjs");
const LichsuThis = require("../models/LichsuThi.cjs");
const { default: mongoose } = require("mongoose");
const _ = require('lodash');
function shuffleObject(obj) {
    // 1. Tách question và các phần còn lại (options) bằng Destructuring
    const { question, ...options } = obj;

    // 2. Lấy danh sách các key của options (option_a, option_b, ...)
    const keys = Object.keys(options);

    // 3. Xáo trộn mảng keys (Sử dụng so sánh ngẫu nhiên đơn giản)
    keys.sort(() => Math.random() - 0.5);

    // 4. Tạo object mới
    // Bắt đầu bằng { question: ... } để nó nằm đầu tiên
    const newObj = { question: question };

    // Duyệt qua các key đã xáo trộn và gán giá trị vào object mới
    keys.forEach(key => {
        newObj[key] = options[key];
    });
// console.log(newObj)
    return newObj;
}


// const { question, ...rest } = shuffledObj;
// const result = Object.keys(rest);
// result là mảng các [option] sau khi sắp random 
module.exports = {
  getDonviList: async (req, res) => {
    try {
      let donvis = await Donvis.find().sort({ thutu: 1 });
      res.status(200).json({ status: "success", donvis });
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: "Có lỗi xảy ra khi lấy danh sách đơn vị. Vui lòng liên hệ quản trị viên",
      });
    }
  },
 
  //thitracnghiem
  getAllMonthi: async (req,res) => {
    try {
      let data = await Monthis.find().sort({thutu: 1})
      res.status(200).json(data)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },
  getInfoCuocthi: async (req, res) => {
    let id = req.params.id;
    try {
      let item = await Cuocthis.findById(id).populate('monthi');
      res.status(200).json(item)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({
        status: "failed",
        message: error.message,
      });
    }
  },
  //check xem có cuộc thi nào đang active k
  checkActiveTest: async (req, res) => {
    try {
      let checkedTest = await Cuocthis.findOne({status: true});

      if(checkedTest === null){
        const error = new Error('Lỗi do không có cuộc thi nào đang diễn ra trong hệ thống.');
        error.status = 401;
        throw error;
      };

      res.status(200).json(checkedTest)
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(500).json({
        status: "failed",
        message: error.message,
      });
    }
  },

  loginTest: async (req, res) => {
    let {name, phone, id_cuocthi} = req.body;
    try {
      let item = await Cuocthis.findById(id_cuocthi);
      let config = item.config; // cấu hình số câu hỏi

      // let randomQuestions = await Cauhois.aggregate([
      //     { $match: {
      //       $and: 
      //       [{ monthi: item.monthi}, 
      //     ]} 
      //   },
      //     { $sample: { size: item.soluongcauhoi} }
      // ]);
   // 1. Lọc lấy các chuyên đề có số lượng > 0
const activeConfigs = config.filter(c => c.soluongcauhoi > 0);

if (activeConfigs.length === 0) {
    console.log("Không có chuyên đề nào yêu cầu số lượng câu hỏi > 0");
    return []; 
}

// 2. Tạo đối tượng facet động
const facetStage = {};
activeConfigs.forEach((c, index) => {
    // Lấy string ID từ config
    const idString = c.chuyende.$oid || c.chuyende; 
    
    facetStage[`topic_${index}`] = [
        { 
            $match: { 
                // Quan trọng: Phải ép kiểu về ObjectId để DB hiểu
                chuyende: new mongoose.Types.ObjectId(idString) 
            } 
        },
        { $sample: { size: c.soluongcauhoi } }
    ];
});

// 3. Thực thi query
let randomQuestions = [];
try {
    const result = await Cauhois.aggregate([
        { $facet: facetStage },
        {
            $project: {
                finalQuestions: {
                    $concatArrays: Object.keys(facetStage).map(key => `$${key}`)
                }
            }
        }
    ]);

    // Kết quả trả về từ aggregate luôn là một mảng, lấy phần tử đầu tiên
     randomQuestions = result.length > 0 ? result[0].finalQuestions : [];
    
    console.log("Số câu hỏi lấy được:", randomQuestions.length);


} catch (error) {
    console.error("Lỗi khi lấy câu hỏi:", error);
}
// console.log(randomQuestions)
// const randomQuestions = result[0].finalQuestions;

      randomQuestions = _.shuffle(randomQuestions);
      let questionsSave = [];
      // biến đổi loại bỏ answer -> send to client and save localStorage
      let questionsSendClient = randomQuestions.map(i => {
        let {answer, monthi, ...tempQuestion} = i;
        // câu hỏi và  sau khi random các đáp án
        let shuffledObj = shuffleObject({...tempQuestion});
        const { question,__v, _id,chuyende, chuyendeString,createdAt, updatedAt, ...rest } = shuffledObj;
        const options_sort = Object.keys(rest);
        questionsSave.push({
          question: i._id,
          options_sort,
        })
        return {questionlist : shuffledObj, options_sort}
      });

  
      let time = new Date();
      let timeStart = time.getTime(); // đổi ra milisecond giây
      let timeEnd = timeStart + item.thoigianthi * 60 * 1000;

      let newLichsuthi = new LichsuThis({
        thoigianbatdau: timeStart,
        thoigianketthuc: timeEnd,
        thongtinthisinh: {
          name, phone
        },
        id_cuocthi,
        thoigiannopbai: 0,
        questions: questionsSave
      });

      await newLichsuthi.save(); 
      
      let cuocthi = {
        _id: newLichsuthi._id, //id lịch sử thi
        thoigianbatdau: newLichsuthi.thoigianbatdau,
        thoigianketthuc: newLichsuthi.thoigianketthuc,
        thoigiannopbai: newLichsuthi.thoigiannopbai,
        thongtinthisinh: newLichsuthi.thongtinthisinh
      }
      res.status(200).json({item, questionsSendClient, cuocthi})

    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(500).json({
        status: "failed",
        message: error.message,
      });
    }
  },

  checkedTest: async (req, res) => {
    let id = req.params.id; //id bài thi cần test

    try {
      let checked = await LichsuThis.findById(id);
      if(checked === null){
        const error = new Error('Bài thi trên thiết bị đã bị xóa bởi quản trị viên. Vui lòng nhập thông tin để vào thi lần tiếp theo.');
        error.status = 401;
        throw error;
      };

      let checkedNopbai = checked.thoigiannopbai !== 0;
      if(checkedNopbai){
        const error = new Error('Bài thi trên thiết bị đã hoàn thành. Vui lòng nhập lại các thông tin để vào thi lần tiếp theo.');
        error.status = 401;
        throw error;
      };

      let timeNow = new Date();
      timeNow = timeNow.getTime()
      res.status(200).json({timeNow})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(500).json({
        status: "failed",
        message: error.message,
      });
    }
  }, 

  submitTest: async (req, res) => {
    let questions = req.body;

    let id = req.params.id; // id bai thi
    let time = new Date();
    let timeEndTest = time.getTime(); // đổi ra milisecond giây
    try {
      let item = await LichsuThis.findById(id).populate("questions.question")
      // console.log(item)
      let choicedTrue = 0;

      let updatedQuestions = item.questions.map(question=>{
        // get question trùng với dữ liệu câu hỏi gửi lên
        let compareQuestion = questions.find(i=> i._id.toString() === question.question._id.toString());

        // tính ra số câu tra lời đúng
        if(question.question.answer === compareQuestion.choice){
          choicedTrue += 1
        }
        //return  save db
        return {question: question.question._id, options_sort: question.options_sort , choice: compareQuestion.choice !== undefined ? compareQuestion.choice : ""}
      });
      
      await LichsuThis.findOneAndUpdate({_id: id},{
        thoigiannopbai: timeEndTest,
        questions: updatedQuestions
      });

      let allQuestion = questions.length;

      let timeStartTest = (new Date(item.thoigianbatdau)).getTime()
      let timeTest = timeEndTest - timeStartTest;

      res.status(200).json({message: "Chúc mừng bạn đã hoàn thành bài thi", choicedTrue, allQuestion, timeTest})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(500).json({
        status: "failed",
        message: error.message,
      });
    }
  },
  previewTest: async (req, res) => {
    let id = req.params.id; // id bai thi
    try {
      let item = await LichsuThis.findById(id).populate("questions.question")
   
      let choicedTrue = 0;

      let questionList = item.questions.map(i=>{
        // tính ra số câu tra lời đúng
        if(i.question.answer === i.choice){
          choicedTrue += 1
        };

        // let shuffledObj = shuffleObject({...i._doc.question});
        // const { question,__v, _id, monthiString,createdAt, updatedAt, ...rest } = shuffledObj;
        // const options_sort = Object.keys(rest);

        return {questionlist: i.question, options_sort: i.options_sort , choice: i.choice}
      });
      

      let allQuestion = item.questions.length;
      res.status(200).json({message: "", choicedTrue, allQuestion, questionList})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(500).json({
        status: "failed",
        message: error.message,
      });
    }
  }
};
