Luồng hoạt động của FE (Ví dụ là file pages/User.tsx)
- B1: User click vào link trên sidebar
- B2: Trong User.tsx gọi các custom hook để lấy data từ API (chỉ đơn giản là gọi API lấy data và một số logic đặc biệt khi gọi API nếu cần)
- B3: sau khi nhân data từ API sẽ lấy data ở đó đổ vào bảng dùng chung (component <Table/>)

Object trả về từ API ví dụ:
  {
    "user_id": "08dd5711-5fa8-4154-8100-3faf858264cc",
    "email": "abcd@gmail.com",
    "display_name": "Tuấn Anh 2",
    "phone_number": "",
    "role_id": "f200e7ee-55e5-4926-a0c6-e1888536c797",
    "functions": [],
    "role_name": "Tài xế",
    "is_locked": false,
    "status": 0,
    "active": true,
    "last_login": null,
    "last_updated": 1742230566
  }

Cách hoạt động của Component <Table/>
- coloumn: Đây là tên cột và lựa chọn các trường sẽ hiển thị ra màn hình
  + Giá trị: Mảng các object gồm key và label với key sẽ trùng với key của object trả về từ API và label là tên cột sẽ hiển thị ra màn hình
  + Ví dụ: Object ví dụ có trường "email" => Muốn bảng hiển thị cột email thì trong object column cần có { key: "email", label: "Email" }
- createField và editField tương tự như column nhưng dùng để tự động tạo ra form edit và form create cách sử dụng tương tự column cũng phải đặt tên key sẽ trùng với key của object
  + Camelname là để map khi gửi dữ liệu xuống back-end nếu form submit yêu cầu key gửi ở dang camel ví dụ userName thay vì user_name
- data: data mà back-end trả về để đổ ra FE (object)
