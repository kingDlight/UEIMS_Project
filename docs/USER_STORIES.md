# UEIMS — Kịch bản demo kể chuyện qua năm người chơi

Trước khi bắt đầu, em xin giới thiệu sơ qua cách kịch bản sẽ diễn ra. Đây là buổi demo năm người, mỗi người đóng một vai khác nhau, cứ nói qua nói lại liên tục như đang thật sự làm việc chứ không phải từng người một. Sẽ có bạn phụ trách máy tính, ngồi bên cạnh, mở sẵn ba cửa sổ Chrome ẩn danh — một cho nhà trường, một cho doanh nghiệp, một cho sinh viên — rồi cứ nghe ai nói thì chuyển sang cửa sổ đó để thao tác. Từ đầu đến cuối, mỗi lời thoại em đều ghi rõ người nói đang làm gì, bạn ấy bấm chỗ nào, kết quả hiện ra cái gì — để Hội đồng cứ ngồi xem là hiểu hết.

Vai diễn của năm người như sau. Người thứ nhất đóng vai Training Manager — người phụ trách toàn bộ kỳ thực tập phía nhà trường, mở đầu và đóng lại buổi demo. Người thứ hai đóng vai nhân sự của FPT Software — người đại diện cho doanh nghiệp trong mọi thao tác đăng ký, tuyển dụng, đánh giá. Người thứ ba đóng vai một sinh viên năm cuối chuyên ngành Software Engineering — người dùng thật sự trải qua cả học kỳ thực tập. Người thứ tư đóng vai Supervisor quản lý thực tập — người trực tiếp đào tạo hàng ngày tại doanh nghiệp. Người thứ năm đóng vai Admin — người giám sát toàn hệ thống, kiểm tra audit log và dashboard. Nếu nhóm chỉ có bốn người thì Người thứ năm có thể được ghép vào Người thứ nhất, vì cả hai đều thao tác trên cùng cửa sổ nhà trường.

Mục đích của cách dàn dựng này là để Hội đồng thấy được một điều rất quan trọng: hệ thống UEIMS không phải một phần mềm chạy một chiều, mà là nơi nhà trường, doanh nghiệp và sinh viên gặp nhau. Một người làm gì thì người khác thấy liền, không cần gửi email qua Zalo chờ đợi. Suốt 45 phút tới, nhóm em sẽ dẫn Hội đồng đi qua toàn bộ vòng đời một kỳ thực tập, từ lúc nhà trường mở học kỳ đến lúc chốt bảng điểm cuối cùng.

---

## Bước 1 — Mở đầu kỳ thực tập

Câu chuyện bắt đầu từ sáng sớm ngày đầu tiên của kỳ thực tập mới. Trong phòng họp của phòng Đào tạo, Người thứ nhất — Training Manager của UEIMS — vừa bật máy tính lên là đã thấy ngay một đống việc phải làm.

### Đoạn 1.1 — Người thứ nhất mở máy và đăng nhập

Người thứ nhất ngồi vào bàn, mở Chrome ẩn danh đầu tiên, gõ đường dẫn hệ thống quản lý thực tập. Tài khoản mới được phòng IT cấp tuần trước, hôm nay là lần đầu đăng nhập. Người ấy gõ email công vụ và mật khẩu mặc định vào ô đăng nhập, bấm nút xanh. Hệ thống xử lý chưa đầy một giây, nhưng thay vì vào thẳng trang chính, màn hình lại chuyển sang một trang bắt buộc đổi mật khẩu. Người ấy mỉm cười, gõ mật khẩu mới dài hơn mười ký tự có cả chữ hoa chữ thường lẫn số, xác nhận lại lần nữa, rồi bấm lưu. Lúc này trang chính mới hiện ra — một dashboard màu trắng xanh gọn gàng, các menu Semesters nằm bên trái, danh sách thông báo nằm giữa, góc trên bên phải có avatar và biểu tượng chuông thông báo. Người thứ nhất đăng nhập thành công.

### Đoạn 1.2 — Người thứ nhất tạo học kỳ mới

Người thứ nhất bắt đầu làm việc thật. Mở menu Semesters, màn hình hiện ra một bảng trống vì đây là kỳ đầu tiên hệ thống vận hành. Bấm nút Create New Semester ở góc trên bên phải. Một form mở ra với mấy ô trống. Người ấy từ từ điền: mã kỳ là SU2026, tên hiển thị Summer 2026, ngày bắt đầu một tháng sáu, ngày kết thúc ba mươi tháng tám. Có hai ô nữa phải điền cẩn thận: hạn chót nộp báo cáo tuần là chủ nhật cuối cùng của mỗi tuần lúc hai mươi ba giờ bốn mươi chín phút, và hạn chót nộp báo cáo cuối kỳ là ngày ba mươi tháng tám. Bấm lưu. Hàng SU2026 vừa xuất hiện trong bảng, trạng thái ghi chữ DRAFT màu xám nhạt.

Nhưng chưa dùng được ngay. Click vào hàng SU2026, chọn Change Status, một hộp thoại nhỏ hiện ra cho chọn trạng thái mới. Chọn OPEN, bấm xác nhận. Badge của hàng đổi sang màu xanh dương nhạt. Lại chọn ACTIVE. Lần này badge chuyển sang màu xanh lá tươi. Học kỳ chính thức hoạt động.

### Đoạn 1.3 — Người thứ nhất đưa danh sách sinh viên vào hệ thống

Mở tiếp menu Eligible Students trong cùng học kỳ SU2026. Màn hình hiện ra một bảng trống. Bấm Import Excel, chọn file từ ổ cứng, kéo thả vào ô upload. Hệ thống bắt đầu xử lý.

Chừng vài giây sau, modal kết quả hiện ra: ba trăm tám mươi dòng thành công, hai mươi dòng bị lỗi. Tò mò bấm vào Download CSV lỗi, một file nhỏ tải về. Mở ra xem, thấy có mười lăm sinh viên có GPA dưới năm phẩy không đạt yêu cầu, và năm sinh viên thiếu email. Gật đầu — đúng như dự đoán, danh sách phòng Đào tạo gửi có lẫn vài bạn chưa đủ điều kiện. Đóng modal, danh sách ba trăm tám mươi sinh viên hợp lệ hiện đầy trong bảng, mỗi hàng có tên, mã sinh viên, chuyên ngành, GPA và trạng thái ELIGIBLE màu xanh lá.

### Đoạn 1.4 — Người thứ hai đăng ký tham gia

Sang cửa sổ Chrome thứ hai. Người thứ hai, HR của FPT Software, vừa nhận được email từ phòng Đào tạo mời doanh nghiệp đăng ký tham gia kỳ thực tập. Mở link trong email, hệ thống hiện ra trang đăng nhập. Gõ email doanh nghiệp và mật khẩu mặc định mà phòng IT công ty cấp. Lần đầu đăng nhập, hệ thống cũng bắt đổi mật khẩu y như Người thứ nhất lúc nãy. Làm theo, tạo mật khẩu mới rồi vào dashboard.

Mở menu Register Semester, một form đăng ký hiện ra. Điền từng mục: mã số thuế của FPT, ngành nghề chính là Dịch vụ Công nghệ Thông tin, quy mô hơn một nghìn nhân viên, mô tả công ty ngắn gọn, địa chỉ trụ sở, người liên hệ chính là trưởng phòng tuyển dụng thực tập. Bấm Submit. Trạng thái của FPT trong hệ thống đổi sang PENDING màu vàng cam.

### Đoạn 1.5 — Người thứ nhất duyệt FPT Software

Lại về cửa sổ Chrome đầu tiên. Hệ thống vừa hiện một thông báo đỏ ở góc: FPT Software vừa nộp đơn đăng ký. Mở menu Enterprises, hàng FPT Software nằm ở trên cùng với badge PENDING màu vàng. Click vào hàng đó, một trang chi tiết hiện ra với đầy đủ thông tin pháp lý mà Người thứ hai vừa nhập. Đọc lướt qua — mã số thuế khớp với công ty, ngành nghề đúng, địa chỉ đúng. Bấm Approve ở góc trên bên phải.

Hệ thống xử lý xong, một thông báo nhỏ hiện ra ở góc dưới bên trái: Đã phê duyệt FPT Software, email đã gửi tới doanh nghiệp. Hàng FPT Software trong bảng đổi badge sang APPROVED màu xanh lá. Đồng thời một tài khoản người dùng mới cũng vừa được tạo sẵn trong hệ thống cho người liên hệ của FPT, kèm quyền doanh nghiệp.

### Đoạn 1.6 — Người thứ hai cập nhật hồ sơ công ty

Lại sang cửa sổ Chrome thứ hai. Người thứ hai vừa nhận được email thông báo đã được duyệt, đồng thời mời đăng nhập lại. Vào Company Profile, thấy các thông tin doanh nghiệp đã có sẵn nhưng khung hình chưa có logo. Upload logo FPT, sửa thêm mô tả công ty chi tiết hơn, thêm website chính thức, rồi bấm Save. Hồ sơ công ty đã đầy đủ.

---

## Bước 2 — Sân chơi tuyển dụng

Đến đây, kỳ thực tập đã chính thức công khai với cả doanh nghiệp và sinh viên. Phần tiếp theo là sân chơi tuyển dụng — nơi doanh nghiệp đăng tin, sinh viên nộp hồ sơ, và hệ thống kết nối hai bên.

### Đoạn 2.1 — Người thứ hai đăng ba tin tuyển dụng

Người thứ hai ngồi vào bàn làm việc, bật menu Job Posts. Một bảng trống hiện ra. Bấm Create New Job. Form mở ra với nhiều ô trống. Tỉ mỉ điền: tiêu đề Backend Java Intern, phần mô tả công việc ghi rõ sẽ làm việc với team backend xây dựng service quản lý người dùng, yêu cầu phải biết Java Spring Boot và PostgreSQL, quyền lợi có cơ hội được tuyển dụng chính thức, công nghệ chọn Java và Spring Boot và PostgreSQL, số lượng tối đa năm người, hạn nộp hồ sơ hai mấy tháng năm. Bấm Publish. Tin đầu tiên xuất hiện trong bảng với badge OPEN màu xanh lá.

Lập tức tạo thêm hai tin nữa: Frontend React Intern và AI Engineer Intern, mỗi tin đều điền đầy đủ như vậy rồi Publish. Trong bảng giờ có ba dòng, mỗi dòng ghi tiêu đề khác nhau, công ty đều là FPT Software, nhưng công nghệ và số lượng khác nhau. Cả ba đều đang mở.

### Đoạn 2.2 — Người thứ ba tìm việc và nộp hồ sơ

Sang cửa sổ Chrome thứ ba, Người thứ ba đóng vai một sinh viên năm cuối ngành Software Engineering. Đăng nhập bằng tài khoản sinh viên, vào menu Jobs. Hệ thống hiển thị tất cả tin tuyển đang mở, kéo thanh lọc chọn công nghệ Java và kỳ SU2026, danh sách lọc lại chỉ còn một tin Backend Java Intern của FPT Software. Click Apply.

Một modal upload hiện ra, yêu cầu phải có CV dạng PDF, không chấp nhận định dạng khác. Kéo file CV dạng PDF vào ô upload — đây là bản CV đã chuẩn bị sẵn. Hệ thống copy file CV và lưu lại đúng nguyên bản tại thời điểm nộp, không cho phép sửa sau này. Bấm Submit. Hồ sơ vừa nộp hiện ra trong menu My Applications với trạng thái PENDING màu vàng.

### Đoạn 2.3 — Người thứ hai đọc CV và cho qua vòng sơ loại

Người thứ hai nhận được thông báo có ứng viên mới. Mở menu Job Posts, click vào tin Backend Java Intern, chuyển sang tab Applications. Hồ sơ của sinh viên nọ nằm ở trên cùng. Click vào đó, hệ thống mở một PDF viewer ngay trong trang, hiển thị CV của ứng viên. Đọc lướt qua — thấy GPA tám phẩy năm, có kinh nghiệm làm project Spring Boot ở trường, từng tham gia cuộc thi hackathon. Đánh dấu là đạt. Bấm Screening Pass, modal nhỏ hiện ra để ghi chú, gõ GPA tám phẩy năm, có kinh nghiệm Spring Boot, bấm Submit. Hồ sơ chuyển sang SCREENING_PASSED màu xanh dương.

### Đoạn 2.4 — Người thứ hai đặt lịch phỏng vấn

Tiếp tục bấm Schedule Interview. Một modal lịch hiện ra. Chọn ngày hai tám tháng năm, giờ là mười bốn giờ, thời lượng bốn mươi lăm phút. Có sẵn link Google Meet mời phỏng vấn, dán vào ô meet link. Hệ thống kiểm tra nhanh — lịch của FPT ngày giờ đó còn trống, không bị trùng với buổi phỏng vấn nào khác. Bấm Submit.

Hệ thống gửi ngay một email cho sinh viên kèm link Meet và thông tin lịch. Sang cửa sổ Chrome thứ ba, Người thứ ba thấy hồ sơ của mình đã đổi sang INTERVIEW_SCHEDULED, có một biểu tượng lịch nhỏ màu xanh dương cạnh dòng, click vào là thấy chi tiết ngày giờ và link Meet.

### Đoạn 2.5 — Người thứ ba xác nhận tham gia

Mở My Applications, click nút Confirm Interview, bấm xác nhận trong modal. Hệ thống ghi nhận đã xác nhận tham gia. Từ giây phút này, không tự ý hủy xác nhận được nữa, và phía doanh nghiệp cũng không thể tự ý thay đổi trạng thái xác nhận mà không để lại dấu vết trong hệ thống. Đây là cách hệ thống bảo vệ quyền lợi của cả hai bên, tránh tình trạng sinh viên hẹn xong rồi trốn, hoặc doanh nghiệp tự ý thay đổi lịch khiến sinh viên không kịp chuẩn bị.

### Đoạn 2.6 — Người thứ hai chấm phỏng vấn và nhận vào thực tập

Hai ngày sau, mở menu Interviews, click vào buổi phỏng vấn của ứng viên. Trong buổi phỏng vấn trực tuyến qua Google Meet, ứng viên trình bày khá tốt, code thuật toán rõ ràng, trả lời câu hỏi về Spring Boot logic. Quay lại form, chọn kết quả PASS, ghi chú Code tốt, tư duy logic, giao tiếp rõ ràng, bấm Submit. Trạng thái chuyển sang INTERVIEW_PASSED.

Bấm tiếp Accept. Hệ thống tự động tạo một dòng trong bảng phân công doanh nghiệp — ứng viên chính thức thuộc về FPT Software từ ngày một tháng sáu. Thông báo gửi về cho cả Người thứ nhất và Người thứ ba. Trong menu Assigned Students của FPT, hàng tên sinh viên xuất hiện với badge trạng thái màu xanh lá đậm.

---

## Bước 3 — Ba tháng thực tập thật sự

Ngày một tháng sáu, Người thứ ba đến văn phòng FPT Software tại tầng mười hai toà nhà FPT. Tại sảnh, Người thứ tư — Supervisor phụ trách đào tạo thực tập sinh — đón và đưa lên phòng làm việc. Đây cũng là người sẽ trực tiếp quản lý suốt ba tháng tới.

### Đoạn 3.1 — Người thứ tư lập lộ trình đào tạo

Người thứ tư đăng nhập vào hệ thống bằng tài khoản riêng, mở menu Assigned Students, tìm hàng của sinh viên vừa nhận. Bấm Create Training Plan. Một form lớn hiện ra. Phần đầu là mục tiêu tổng thể — gõ dài: sinh viên sau kỳ này phải làm chủ Spring Boot, code sạch, có khả năng độc lập xử lý task backend ở mức junior. Ngày bắt đầu một tháng sáu, ngày kết thúc ba mươi tháng tám.

Phần dưới là mười hai dòng, mỗi dòng là một tuần. Điền lần lượt: tuần một làm quen môi trường và đọc tài liệu, tuần hai viết CRUD module User, tuần ba làm REST API module Job, cứ thế cho đến tuần mười hai là tổng kết và báo cáo cuối kỳ. Mỗi tuần có task_description, training_objective và target_date. Bấm Lưu. Một timeline dài mười hai tuần hiện ra trên màn hình, tất cả các ô đều có màu xám PENDING.

### Đoạn 3.2 — Người thứ ba nộp báo cáo tuần một

Hết tuần một, vào menu Training Plan trong hệ thống, thấy ngay mục tiêu tổng thể của Người thứ tư và timeline mười hai tuần. Bấm Submit Week 1 Report, một form hiện ra. Kể lại những gì đã làm: hoàn thành CRUD module User, gặp khó khăn khi hiểu JPA mapping với quan hệ OneToMany, học được cách dùng annotation đúng cách, tuần sau sẽ viết REST API cho module Job. Bấm Submit.

Hệ thống ghi nhận báo cáo, nhưng đồng thời cũng âm thầm chạy một thuật toán so sánh nội dung vừa nộp với tất cả các báo cáo cũ trong hệ thống — nếu phát hiện nội dung quá giống ai đó thì sẽ bật cờ cảnh báo ngay. May mắn là bài này viết bằng kinh nghiệm thật của mình, điểm tương đồng chỉ mười hai phần trăm, badge hiện màu xanh lá bình thường.

### Đoạn 3.3 — Người thứ tư đọc và phản hồi

Người thứ tư nhận được thông báo có báo cáo tuần vừa nộp. Mở Weekly Reports, đọc toàn bộ nội dung. Thấy viết khá rõ ràng, phần khó khăn trung thực, phần kế hoạch tuần sau cụ thể. Gõ feedback: Báo cáo tốt, phân tích rõ ràng, tuần sau nên tìm hiểu thêm về authentication và authorization. Bấm Approve.

Ngay khi bấm Approve, bài báo cáo bị khóa lại — không tự sửa lại nội dung nữa, trừ khi Reject để yêu cầu chỉnh sửa. Hàng tuần một trong timeline chuyển sang màu xanh lá COMPLETED, có một biểu tượng feedback màu xanh dương ở bên cạnh.

### Đoạn 3.4 — Mười một tuần còn lại lặp lại theo cùng một nhịp

Tuần hai, Người thứ ba nộp báo cáo về REST API module Job, Người thứ tư duyệt. Tuần ba, làm authentication bằng JWT, Người thứ tư duyệt và góp ý thêm về refresh token. Tuần bốn, năm, sáu cứ thế trôi qua. Mỗi tuần Người thứ ba đều ngồi lại cuối tuần, viết vài trăm từ kể lại công việc, Người thứ tư dành mười phút đọc và góp ý. Đến tuần mười hai, cả mười hai ô trong timeline đều chuyển sang màu xanh lá hoàn toàn.

---

## Bước 4 — Sự cố giữa kỳ

Không phải mọi chuyện đều êm đẹp. Giữa kỳ thực tập, có lần sinh viên nghỉ ba ngày liên tiếp mà không xin phép. Người thứ tư bực mình nhưng vẫn làm đúng quy trình.

### Đoạn 4.1 — Người thứ tư báo cáo sự cố

Mở menu Incidents, bấm Report Incident, điền form. Loại sự cố là nghỉ kéo dài không phép, thời gian từ mười lăm tháng sáu đến mười bảy tháng sáu, mức độ nghiêm trọng là cao. Upload file PDF — đó là đơn xin phép đã từng nộp trước đó nhưng chưa được duyệt. Mô tả ngắn gọn. Bấm Submit.

Hệ thống ghi nhận sự cố với trạng thái OPEN, đồng thời tự động gửi thông báo về cho Người thứ nhất ngay lập tức. Trên cửa sổ Chrome của Người thứ nhất, badge đỏ xuất hiện ở menu Incidents.

### Đoạn 4.2 — Người thứ nhất tiếp nhận và xử lý

Người thứ nhất đang làm việc thì nhìn thấy badge đỏ. Mở menu Incidents, click vào sự cố vừa nhận, đọc chi tiết mô tả của Người thứ tư, mở file PDF bằng chứng xem qua. Gật đầu — đây là việc nghiêm túc, sinh viên nghỉ ba ngày không phép giữa kỳ thực tập là không chấp nhận được. Bấm Acknowledge, ghi internal note là đã liên hệ với sinh viên và sinh viên cam kết không tái phạm. Trạng thái sự cố chuyển sang ACKNOWLEDGED màu xanh dương nhạt.

Mấy ngày sau, khi xác nhận sinh viên đã đi làm lại đầy đủ, quay lại sự cố, bấm Resolve, ghi note kết quả là sinh viên đã cam kết và đi làm đầy đủ lại. Trạng thái cuối cùng là RESOLVED màu xanh lá.

### Đoạn 4.3 — Người thứ nhất rà soát sinh viên nguy cơ

Song song với việc xử lý sự cố, mở menu At-Risk Students. Đây là màn hình tự động tổng hợp những sinh viên đang gặp vấn đề. Bảng hiện ra ba dòng. Một sinh viên trễ hạn nộp báo cáo tuần năm. Một sinh viên có báo cáo bị đánh dấu nghi ngờ sao chép. Một sinh viên vừa báo cáo trễ deadline báo cáo cuối kỳ. Chọn sinh viên trễ deadline trên cùng, bấm Send Late Report Warning.

Hệ thống ghi nhận cảnh cáo, đồng thời tự động gửi email và thông báo trong chuông bell cho sinh viên đó. Trên cửa sổ Chrome thứ ba, sinh viên thấy chuông thông báo đỏ — Cảnh cáo: Bạn đã trễ hạn nộp Weekly Report tuần 5, vui lòng nộp trong vòng hai mươi bốn giờ.

### Đoạn 4.4 — Sinh viên kia nộp bổ sung

Sinh viên bị cảnh cáo hoảng hốt mở máy tính lên, soạn ngay báo cáo tuần năm trong đêm, bấm Submit. Hệ thống ghi nhận báo cáo bổ sung. Tuy nhiên, do là nộp trễ, bản ghi sẽ được đánh dấu đặc biệt để Người thứ nhất biết mà theo dõi thêm.

---

## Bước 5 — Đánh giá cuối kỳ

Đến ba mươi tháng tám, kỳ thực tập chính thức kết thúc. Toàn bộ sinh viên đã nộp đủ mười hai báo cáo tuần. Bây giờ là phần việc cuối cùng — đánh giá và chốt điểm.

### Đoạn 5.1 — Người thứ ba nộp báo cáo cuối kỳ

Mở menu Final Report. Đây là báo cáo tổng kết, dạng PDF, tối đa hai mươi megabyte. Upload file báo cáo — bản báo cáo đã dày công viết suốt cả kỳ, tổng kết lại toàn bộ quá trình thực tập tại FPT Software, kiến thức đã học, sản phẩm đã làm, bài học kinh nghiệm. Điền tiêu đề Xây dựng hệ thống quản lý OJT tại FPT Software, tóm tắt khoảng ba trăm từ, từ khoá Spring Boot, PostgreSQL, React. Bấm Submit. Trạng thái SUBMITTED màu xanh dương.

### Đoạn 5.2 — Người thứ tư đánh giá năng lực

Mở menu Evaluations, chọn bảng đánh giá của sinh viên. Một form Rubrics hiện ra với bốn tiêu chí: thái độ làm việc, tính chuyên nghiệp, kỹ năng mềm, tiến bộ trong kỳ. Chấm lần lượt: chín trên mười, tám trên mười, chín trên mười, tám trên mười. Phần nhận xét tổng thể, gõ: Sinh viên tốt, code sạch, teamwork ổn, có thể tuyển dụng chính thức sau khi tốt nghiệp. Bấm Submit.

Hệ thống tự động tính tổng điểm có trọng số — tám phẩy năm — rồi khóa lại, không cho sửa điểm nữa. Hàng đánh giá hiện ra trong bảng với điểm tổng tám phẩy năm và một biểu tượng ổ khoá nhỏ màu xám ở cuối hàng — báo hiệu đã chốt.

### Đoạn 5.3 — Người thứ nhất chốt điểm tổng kết

Mở menu Final Grades, chọn hàng sinh viên. Phần điểm từ phía doanh nghiệp — tám phẩy năm — hiện sẵn màu xám, không sửa được. Nhập điểm cuối kỳ là tám phẩy hai, chọn xếp loại PASSED. Bấm Submit. Hàng chuyển sang badge xanh lá đậm PASSED.

### Đoạn 5.4 — Người thứ ba phản hồi chất lượng FPT

Cũng có trách nhiệm ngược lại. Mở menu Feedback for Enterprise, điền form: chất lượng đào tạo chín trên mười, supervisor hỗ trợ mười trên mười, môi trường làm việc tám trên mười, đánh giá tổng thể chín trên mười. Phần nhận xét tích cực viết: Mentor nhiệt tình, môi trường chuyên nghiệp, em học được rất nhiều điều thực tế. Bấm Submit. Phản hồi gửi đi ẩn danh — FPT chỉ thấy điểm tổng hợp, không thấy chi tiết từng sinh viên — để sinh viên phản hồi thật lòng.

### Đoạn 5.5 — Người thứ năm xem dashboard tổng hợp

Người thứ năm — Admin giám sát toàn hệ thống — bước vào đoạn cuối. Mở Dashboard Analytics. Bốn khối lớn hiện ra với hiệu ứng chuyển động nhẹ. Khối đầu tiên là biểu đồ tròn — chín mươi hai phần trăm PASSED, năm phần trăm FAILED, ba phần trăm CANCELLED. Khối thứ hai là biểu đồ cột — SE chiếm bốn mươi lăm phần trăm, AI ba mươi phần trăm, IA mười lăm phần trăm, các ngành khác mười phần trăm. Khối thứ ba là histogram phổ điểm doanh nghiệp, phân bố từ không đến mười, đỉnh rơi vào khoảng tám. Khối thứ tư là biểu đồ đường — xu hướng trúng tuyển theo tuần, đường đi lên đều đặn.

Click thử vào khối tỷ lệ đậu — hệ thống chuyển sang trang danh sách sinh viên với bộ lọc PASSED, liệt kê hàng trăm dòng. Click sang khối chuyên ngành SE — danh sách lọc lại theo chuyên ngành. Mỗi khối đều có khả năng mở rộng chi tiết, đây gọi là drill-down.

### Đoạn 5.6 — Người thứ nhất xuất bảng điểm PDF

Người thứ nhất quay lại sân khấu để hoàn tất thao tác cuối cùng. Vào menu Final Grades, bấm nút Export PDF. Bộ lọc hiện ra, chọn kỳ SU2026 và trạng thái PASSED. Hệ thống xử lý vài giây, file bảng điểm PDF tải về máy. Mở file lên cho Hội đồng xem: logo trường ở góc trên, tiêu đề Bảng điểm tổng kết thực tập kỳ Summer 2026, bảng danh sách đầy đủ gồm mã số sinh viên, họ tên, doanh nghiệp thực tập, điểm doanh nghiệp, điểm cuối, xếp loại. Tên sinh viên của Người thứ ba nằm ở dòng thứ ba, điểm tám phẩy hai xếp loại Giỏi. Phía dưới là phần chữ ký của Training Manager và Trưởng phòng Đào tạo.

### Đoạn 5.7 — Người thứ năm kiểm tra audit log

Cuối buổi demo, Người thứ năm mở menu Audit Logs. Một bảng dài hơn hai trăm dòng hiện ra, ghi lại toàn bộ hành động vừa diễn ra trong suốt kỳ thực tập: ai đăng nhập lúc nào, ai duyệt doanh nghiệp, ai đăng tin tuyển dụng, ai nộp báo cáo tuần nào, ai chấm điểm ra sao, ai xuất PDF. Mỗi dòng có người thực hiện, thời điểm chính xác đến giây, địa chỉ IP máy tính.

Điều đặc biệt là bảng này không ai có thể sửa. Kể cả Admin cũng không thể tự ý thay đổi một dòng lịch sử nào. Đây là cam kết của hệ thống về tính minh bạch — mọi hành động đều để lại dấu vết vĩnh viễn.

---

## Kết thúc

Đến đây, cả năm người cùng đứng dậy. Trong phòng họp lúc này có Người thứ nhất Training Manager, Người thứ hai từ FPT Software, Người thứ ba sinh viên, Người thứ tư Supervisor, và Người thứ năm Admin — tất cả đều đã đóng vai mình suốt bốn mươi lăm phút vừa qua.

Câu chuyện hôm nay kể về một kỳ thực tập hoàn chỉnh. Bắt đầu từ sáng sớm khi Người thứ nhất mở máy tính và đăng nhập lần đầu, cho đến cuối ngày ba mươi tháng tám khi Người ấy bấm nút xuất bảng điểm PDF. Trong khoảng thời gian đó, không có một tờ giấy nào được in ra. Không có email xin lịch phỏng vấn qua Zalo. Không có file Excel báo cáo tuần gửi qua Google Drive rồi thất lạc. Tất cả đều diễn ra trong một hệ thống duy nhất, mọi người cùng nhìn thấy mọi người, mọi hành động đều có lịch sử, mọi quyết định đều có người chịu trách nhiệm.

Sinh viên apply trực tuyến, nộp báo cáo trực tuyến, nhận cảnh cáo trực tuyến, đọc điểm trực tuyến. Doanh nghiệp đăng tin, sàng lọc, phỏng vấn, đánh giá đều trực tuyến. Nhà trường giám sát, cảnh cáo, chấm điểm, xuất bảng điểm cũng trực tuyến. Kỳ thực tập kết thúc, tất cả dữ liệu nằm gọn trong cơ sở dữ liệu, sẵn sàng cho phòng Đào tạo truy xuất bất cứ lúc nào.

Phần trình bày của nhóm em xin kết thúc tại đây. Em xin cảm ơn Hội đồng đã dành thời gian lắng nghe, và em sẵn sàng trả lời bất kỳ câu hỏi nào ạ.

---

## Phụ lục tra cứu nhanh

Phần này chỉ dành cho nhóm em khi cần tra cứu lại trong lúc demo, hoặc khi Hội đồng hỏi về một chức năng cụ thể. Trong lúc kể chuyện, em không nhắc đến những chi tiết kỹ thuật, nhưng nếu Hội đồng hỏi thì em biết ngay từ đâu đến đâu.

**Đăng nhập và bảo mật (Bước 1):**
- Đoạn 1.1: đăng nhập, đổi mật khẩu bắt buộc lần đầu, xử lý sai mật khẩu năm lần
- Đoạn 1.4, 1.5: tạo tài khoản doanh nghiệp tự động khi duyệt, khoá đăng nhập khi chưa đổi mật khẩu

**Học kỳ và sinh viên (Bước 1):**
- Đoạn 1.2: tạo học kỳ, chuyển trạng thái tuần tự DRAFT → OPEN → ACTIVE → CLOSED → LOCKED
- Đoạn 1.3: import Excel, loại sinh viên không đủ điều kiện (GPA dưới năm phẩy không, thiếu trường bắt buộc)

**Doanh nghiệp (Bước 1, 2):**
- Đoạn 1.4, 1.5: đăng ký doanh nghiệp, phê duyệt, cấp quyền
- Đoạn 2.1, 2.3, 2.4, 2.6: đăng tin tuyển dụng, sàng lọc, đặt lịch phỏng vấn, nhận thực tập sinh

**Sinh viên (Bước 2, 3):**
- Đoạn 2.2: tìm việc, nộp hồ sơ
- Đoạn 2.5: xác nhận phỏng vấn (một chiều)
- Đoạn 3.2: nộp báo cáo tuần, phát hiện đạo văn
- Đoạn 5.1: nộp báo cáo cuối kỳ
- Đoạn 5.4: phản hồi doanh nghiệp ẩn danh

**Đào tạo OJT (Bước 3):**
- Đoạn 3.1: lập lộ trình đào tạo mười hai tuần có mục tiêu
- Đoạn 3.3: duyệt báo cáo, khoá báo cáo đã duyệt
- Đoạn 3.4: lặp lại mười hai tuần

**Sự cố và cảnh cáo (Bước 4):**
- Đoạn 4.1, 4.2: báo cáo sự cố nghiêm trọng, xử lý
- Đoạn 4.3, 4.4: sinh viên nguy cơ, cảnh cáo trễ deadline

**Đánh giá cuối kỳ (Bước 5):**
- Đoạn 5.2: đánh giá theo rubrics bốn tiêu chí, khoá sau khi nộp
- Đoạn 5.3: chốt điểm cuối kỳ (PASSED từ năm phẩy không)
- Đoạn 5.5: dashboard bốn khối có drill-down
- Đoạn 5.6: xuất bảng điểm PDF với chữ ký
- Đoạn 5.7: audit log bất biến

---

## Phụ lục trả lời nhanh khi Hội đồng hỏi

Phần này nhóm em dùng để chuẩn bị sẵn câu trả lời cho mười câu hỏi mà Hội đồng hay hỏi nhất. Em sẽ nói tự nhiên, không đọc nguyên văn, nhưng nội dung cốt lõi là như vậy.

**Hỏi: Hệ thống có chống gian lận điểm không?**

Dạ có ạ. Hệ thống có nhiều lớp bảo vệ. Thứ nhất, bảng lịch sử là bảng bất biến — không ai có thể sửa lại hành động đã diễn ra, kể cả Admin. Thứ hai, bảng điểm doanh nghiệp có cơ chế khoá — sau khi nộp thì không ai sửa được nữa. Thứ ba, bảng điểm cuối kỳ chỉ có thể hủy bởi Admin, không phải Training Manager thường. Thứ tư, hệ thống tự động tính điểm tương đồng giữa các báo cáo để phát hiện đạo văn. Tóm lại là có bốn lớp bảo vệ chồng lên nhau.

**Hỏi: Tại sao mỗi người chỉ có một vai trò duy nhất?**

Dạ để tránh xung đột quyền ạ. Nếu một người vừa là sinh viên vừa là doanh nghiệp thì sẽ rất khó kiểm soát — ví dụ họ có thể tự duyệt hồ sơ của chính mình. Hệ thống UEIMS quy định mỗi người dùng chỉ có đúng một vai trò, đảm bảo phân quyền rõ ràng.

**Hỏi: Sinh viên nộp trễ deadline có bị chặn không?**

Dạ có ạ. Hệ thống tự động kiểm tra ngày nộp so với deadline. Nếu muộn quá thì hệ thống sẽ không cho nộp. Nếu muốn nộp bù thì phải có Training Manager can thiệp và đánh dấu đặc biệt, để ai cũng biết bài này nộp trễ.

**Hỏi: Hệ thống có chống đạo văn không?**

Dạ có ạ. Khi sinh viên nộp báo cáo, hệ thống tự động so sánh nội dung vừa nộp với tất cả báo cáo cũ trong cơ sở dữ liệu. Nếu giống quá tám mươi lăm phần trăm thì bật cờ cảnh báo, Training Manager sẽ thấy ngay trên dashboard.

**Hỏi: Làm sao biết sinh viên nào đang nguy cơ?**

Dạ hệ thống có màn hình tự động tổng hợp những sinh viên đang có vấn đề — gồm ba nhóm: trễ deadline báo cáo, có sự cố nghiêm trọng chưa xử lý, điểm đánh giá thấp. Training Manager vào đó thấy ngay, một click là gửi cảnh cáo.

**Hỏi: Học kỳ đã chạy rồi có thay đổi được không?**

Dạ không ạ. Học kỳ có vòng đời rõ ràng — từ bản nháp, sang mở, sang chạy, sang đóng, sang khoá. Không thể lùi, không thể sửa ngày. Đây là cách đảm bảo dữ liệu lịch sử luôn đúng.

**Hỏi: Hệ thống chạy được với bao nhiêu sinh viên?**

Dạ hiện tại đã seed gần một nghìn bản ghi thực tế và chạy ổn ạ. Về mặt lý thuyết thì một cơ sở dữ liệu PostgreSQL cấu hình trung bình có thể phục vụ vài nghìn sinh viên đồng thời. Nếu cần lớn hơn nữa thì tách bạn đọc ghi và thêm cache.

**Hỏi: Sao không xóa cứng mà chỉ xoá mềm?**

Dạ để giữ lịch sử ạ. Nếu xoá cứng thì sẽ mất dấu vết, không truy vết được nữa. Hệ thống chỉ đánh dấu đã xoá, ai cũng biết có ai đó đã xoá, chỉ là không hiện lên màn hình nữa thôi.

**Hỏi: Một bản ghi bị xoá nhầm thì sao?**

Dạ vẫn lấy lại được ạ. Vì xoá mềm nên admin có thể vào cơ sở dữ liệu đánh dấu lại, bật lại bản ghi đó. Trong thực tế thì hệ thống ít khi cho xoá nhầm vì mọi thao tác đều phải qua xác nhận hai bước.

**Hỏi: Có thể thử bản demo ở đâu?**

Dạ sau buổi bảo vệ nhóm em sẽ gửi lại đường dẫn kèm tài khoản mẫu để Hội đồng tự tay trải nghiệm ạ. Trong tài liệu đính kèm có hướng dẫn cụ thể.

---

## Lưu ý cuối cùng cho bạn phụ trách máy tính

Bạn Operator cần ghi nhớ vài điều để buổi diễn không bị trục trặc:

Trước buổi demo, hãy mở sẵn ba cửa sổ Chrome ẩn danh, đăng nhập sẵn vào ba tài khoản. Bookmark tám đường dẫn quan trọng để click một phát là tới nơi. Chuẩn bị sẵn một file Excel bốn trăm dòng, một file CV PDF, một file báo cáo cuối kỳ PDF, một file PDF bằng chứng cho sự cố. Test chạy thử toàn bộ từ đầu đến cuối một lần.

Trong buổi demo, nghe ai nói thì Alt+Tab sang đúng cửa sổ của người đó. Đợi người nói xong hẳng thao tác, đừng làm trước. Mỗi thao tác quan trọng đợi hai ba giây để Hội đồng nhìn rõ kết quả hiện ra trên màn hình. Nếu xảy ra lỗi thì bình tĩnh, F5 và làm lại, đừng hoảng. Khi xuất bảng điểm PDF thì nhớ mở luôn file cho Hội đồng xem, đừng chỉ bấm nút xong rồi để đó.

Toàn bộ kịch bản gồm ba mươi đoạn, dự kiến chạy từ ba mươi lăm đến bốn mươi lăm phút. Nếu Hội đồng muốn demo ngắn hơn thì có thể tua nhanh đoạn mười một tuần lặp lại. Nếu muốn dài hơn thì có thể kể thêm phần xử lý khiếu nại hoặc phần phân quyền Admin. Cả nhóm đã chuẩn bị sẵn mọi thứ, giờ chỉ còn chờ Hội đồng bắt đầu giờ thôi.

Đặc biệt chú ý: có thể đổi người đóng vai bất kỳ lúc nào, không ai bắt buộc phải là ai — chỉ cần nhớ Người thứ nhất luôn là Training Manager, Người thứ ba luôn là Sinh viên, ba người còn lại có thể hoán đổi cho nhau tùy nhóm muốn.
