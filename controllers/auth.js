const jwt = require("jsonwebtoken");
const RefreshTokens = require("../models/RefreshToken");
const Users = require("../models/User");

module.exports = {
  login: async (req, res) => {
    try {
      let user = await Users.findOne({
        tentaikhoan: req.body.tentaikhoan,
        matkhau: req.body.matkhau,
      });
      if (!user) {
        return res.status(403).json({ status: false, message: "Sai tên đăng nhập hoặc mật khẩu" });
      } else {
      //cần kiểm tra xem client có refreshtoken k nếu có thì phải kiểm tra db và xóa đi khi login thành công và tạo mới refreshtoken
      let refreshTokenCookie = req.cookies.refreshToken;
      if(refreshTokenCookie){
        await RefreshTokens.findOneAndDelete({refreshToken: refreshTokenCookie})
      };

        //generate accessToken, refreshToken
        const accessToken = jwt.sign({ userId: user._id }, "vuvantinh_accessToken",{
          expiresIn: '1h'
        });


        const refreshToken = jwt.sign({ userId: user._id }, "vuvantinh_refreshToken",{
          expiresIn: '7d'
        });

        let newItem = new RefreshTokens({
          refreshToken
        });
        await newItem.save()

        res.status(200).json({ status: "success",_id:user._id, tentaikhoan: user.tentaikhoan, roles: user.roles, accessToken, refreshToken });
      }
    } catch (error) {
      console.log(error.message )
      res.status(401).json({ status: "failed", message: "Lỗi đăng nhập hệ thống" });
    }
  },
  logout: async(req, res) => {
    //xóa refreshTonken trong database
    let refreshTokenCookie = req.cookies.refreshToken;
    try {
      if(refreshTokenCookie){
        await RefreshTokens.findOneAndDelete({refreshToken: refreshTokenCookie})
      };

      //xóa cookie
      // res.clearCookie('refreshToken_px01');
      res.status(200).json({status: "success",message: "Đăng xuất thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Lỗi server hệ thống" });
    }
  },
  getUserList: async (req, res) => {
    let perPage = 5;
    
    let page = Number(req.query.page) || 1;
    try {
      let usersDb = await Users.find().populate('quantrinhomdonvi').sort({thutu: 1});

      let total = Math.ceil(usersDb.length/perPage);
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage).populate('quantrinhomdonvi');
      res.status(200).json({status: "success", users, page,total})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi lấy dữ liệu người dùng" });
    }
  },
  addUser: async(req, res) => {
    let {tentaikhoan, matkhau, thutu} = req.body;
    let perPage = 5;
    let page = 1;
    try {
      let newItem = new Users({
        tentaikhoan,
        matkhau,
        thutu:Number(thutu), 
        roles: [],
        quantrinhomdonvi: []
      });
      await newItem.save();
      let usersDb = await Users.find().sort({thutu: 1});

      let total = Math.ceil(usersDb.length/perPage);
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);
      res.status(200).json({status: "success", users, total, message: "Thêm tài khoản người dùng thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi thêm mới người dùng" });
    }
  },
  editUser: async (req, res) => {
    let id = req.params.id;
    const {roles,page} = req.body;
    // const {roles, page} = req.body;
    let perPage =5;
    try {
      await Users.findByIdAndUpdate(id, {
        roles
      });
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);

      res.status(200).json({status: "success", users,  message: "Cập nhật phân quyền tài khoản người dùng thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi cập nhật phân quyền người dùng" });
    }
  },
  deleteUser: async (req, res) => {
    let id = req.params.id;
    let perPage = 5;
    let page = 1;
    try {
      await Users.findByIdAndDelete(id);
      let usersDb = await Users.find().sort({thutu: 1});

      let total = Math.ceil(usersDb.length/perPage);
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage);

      res.status(200).json({status: "success", users, total, message: "Xóa tài khoản người dùng thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi xóa người dùng" });
    }
  },

  requestRefreshToken: async (req, res) => {
    // console.log(req.cookies)
    const refreshToken = req.cookies.refreshToken_thitracnghiem;
    // console.log(refreshToken)
    if(!refreshToken){
      return res.status(401).json({message: 'You are not authenticated'})
    };
    // console.log(refreshToken)
    // kiểm tra xem trong db có refreshtoken này không nếu k có thì là k hợp lệ
    const checkRefreshTokenInDb = await RefreshTokens.findOne({refreshToken});
    // console.log('token',checkRefreshTokenInDb)
    // console.log(checkRefreshTokenInDb)
    if(!checkRefreshTokenInDb) return res.status(403).json({message: "Token không hợp lệ"});

    jwt.verify(refreshToken, "vuvantinh_refreshToken", async (err, user) => {
      if(err){
        console.log(err.message)
      };

      const newAccessToken = jwt.sign({ userId: user.userId }, "vuvantinh_accessToken",{
        expiresIn: '1h'
      });

      const newRefreshToken = jwt.sign({ userId: user.userId }, "vuvantinh_refreshToken",{
        expiresIn: '7d'
      });

      await RefreshTokens.findOneAndDelete({refreshToken: refreshToken})
      // thêm refreshtoken mới vào db sau đó trả về client accesstoken mới
      let newItem = new RefreshTokens({
        refreshToken: newRefreshToken
      });
      await newItem.save()
      res.status(200).json({accessToken: newAccessToken, refreshToken: newRefreshToken})
      console.log('ok')
    })
  },
  editPhanquyendonvi: async (req, res) => {
    let id = req.params.id;
    const {quantrinhomdonvi,page} = req.body;
    // const {roles, page} = req.body;
    let perPage =5;
    try {
      await Users.findByIdAndUpdate(id, {
        quantrinhomdonvi
      });
      let users = await Users.find().sort({thutu: 1}).skip((page -1)*perPage).limit(perPage).populate('quantrinhomdonvi');

      res.status(200).json({status: "success", users,  message: "Cập nhật phân quyền quản trị nhóm đơn vị thành công"})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Có lỗi xảy ra khi cập nhật phân quyền quản trị nhóm đơn vị" });
    }
  },
  changePassword: async (req, res) => {
    let {tentaikhoan, matkhau, matkhaumoi} = req.body;
    // console.log(req.body)
    try {
      let user = await Users.findOne({tentaikhoan,matkhau});
      if(!user){
        res.status(401).json({message: "Tài khoản và mật khẩu cũ không chính xác. Vui lòng kiểm tra lại"})
        return;
      }

      user.matkhau = matkhaumoi;
      await user.save();
      res.status(200).json({message: "Đổi mật khấu thành công. Vui lòng đăng nhập lại."})
    } catch (error) {
      console.log("lỗi: ", error.message);
      res.status(401).json({ status: "failed", message: "Lỗi server, Vui lòng liên hệ quản trị hệ thống" });
    }
  }
};
