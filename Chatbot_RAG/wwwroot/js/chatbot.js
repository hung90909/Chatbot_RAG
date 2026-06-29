let fileUploaded = false;
let fileName = '';
// Dữ liệu giả lập - bạn thay bằng dữ liệu thật khi nối backend
const MOCK_DATA = {
    "TS001": {
        vi_tri: "Tầng 3, Tòa nhà Bộ Tài Chính, 28 Trần Hưng Đạo, Hà Nội",
        gia_tri: "2.5 tỷ VNĐ",
        trang: 5,
        chi_tiet: "Máy chủ Dell PowerEdge R750, Serial: DELL2024-001"
    },
    "TS002": {
        vi_tri: "Chi nhánh Hà Nội, Kho số 2, KCN Thăng Long",
        gia_tri: "850 triệu VNĐ",
        trang: 12,
        chi_tiet: "Xe ô tô Toyota Camry 2.5Q, BKS: 29A-888.88"
    },
    "TS003": {
        vi_tri: "Chi nhánh TP.HCM, 123 Nguyễn Huệ, Q1",
        gia_tri: "1.2 tỷ VNĐ",
        trang: 18,
        chi_tiet: "Hệ thống hội nghị truyền hình Polycom RealPresence"
    },
    "TS004": {
        vi_tri: "Chi nhánh Đà Nẵng, 45 Bạch Đằng",
        gia_tri: "650 triệu VNĐ",
        trang: 23,
        chi_tiet: "Máy photocopy Konica Minolta Bizhub C759"
    }
};
var chatbot = {
    el: {
        questionInput:"#questionInput"
    },
    btn: {
        btnUpFile: "#btnUpFile",
        btnSend: "#btnSend",
        btnDaHieu: "#btnDaHieu",


    },
    init: function () {

        // Chọn file
        $("#btnUpFile").off("click").on("click", function () {
            $("#pdfInput").click();
        });

        // Sau khi chọn file
        $("#pdfInput").off("change").on("change", function () {

            if (this.files.length === 0)
                return;

            const file = this.files[0];

            fileUploaded = true;
            fileName = file.name;

            $("#uploadBox").addClass("uploaded");
            $("#uploadText").html(`✅ Đã nạp: <b>${fileName}</b> - Sẵn sàng truy vấn`);

            chatbot.addBotMsg(
                "Đã nạp tài liệu thành công! Tôi đã index xong. Bạn có thể hỏi tôi về tài sản trong file."
            );
        });

        // 2. Bấm nút hỏi nhanh
        $('.btn-secondary').on('click', function () {
            const question = $(this).text();
            if (question.includes('TS001')) chatbot.askQuick('Tài sản mã TS001 hiện đang ở đâu?');
            else if (question.includes('Hà Nội')) chatbot.askQuick('Liệt kê tài sản ở chi nhánh Hà Nội');
            else if (question.includes('> 1 tỷ')) chatbot.askQuick('Tài sản nào có giá trị trên 1 tỷ?');
        });

        // 3. Nút "Xem luồng LangChain"
        $('[onclick="showFlow()"]').on('click', chatbot.showFlow());
        $('#flowModal').on('click', chatbot.closeFlow());
        $('.modal-content').on('click', function (e) { e.stopPropagation(); });

        // 4. Enter để gửi
        $('#questionInput').on('keypress', function (e) {
            if (e.which === 13) chatbot.sendQuestion();
        });

        // 5. Nút Gửi
        $('#btnSend').off('click').on('click', chatbot.sendQuestion());

    },
    // 1. Upload PDF
 

    askQuick: function (question) {
        $('#questionInput').val(question);
        chatbot.sendQuestion();
    },

sendQuestion: function () {
    const question = $('#questionInput').val().trim();
    if (!question) return;

    chatbot.addUserMsg(question);
    $('#questionInput').val('');

    // Hiển thị typing
    const typingId = chatbot.addTypingMsg();

    setTimeout(() => {
        chatbot.removeTypingMsg(typingId);
        if (!fileUploaded) {
            chatbot.addBotMsg("⚠️ Vui lòng upload file PDF tài sản trước khi hỏi.");
            return;
        }
        const answer = chatbot.mockRAG(question);
        chatbot.addBotMsg(answer.text, answer.sources);
    }, 1200);
},

 mockRAG: function(question) {
    const q = question.toLowerCase();

    if (q.includes('ts001')) {
        const d = MOCK_DATA.TS001;
        return {
            text: `Tìm thấy thông tin <b>Tài sản TS001</b>:<br>
                       • <b>Vị trí:</b> ${d.vi_tri}<br>
                       • <b>Giá trị:</b> ${d.gia_tri}<br>
                       • <b>Chi tiết:</b> ${d.chi_tiet}`,
            sources: [{ page: d.trang, content: `TS001 - ${d.chi_tiet}, nguyên giá ${d.gia_tri}, vị trí: ${d.vi_tri}` }]
        };
    }

    if (q.includes('hà nội')) {
        return {
            text: `Tại <b>chi nhánh Hà Nội</b> hiện có 2 tài sản:<br>
                       1. <b>TS001</b> - ${MOCK_DATA.TS001.gia_tri} - ${MOCK_DATA.TS001.chi_tiet}<br>
                       2. <b>TS002</b> - ${MOCK_DATA.TS002.gia_tri} - ${MOCK_DATA.TS002.chi_tiet}<br><br>
                       <b>Tổng giá trị:</b> 3.35 tỷ VNĐ`,
            sources: [
                { page: 5, content: "TS001 - Hà Nội, Tầng 3 Bộ Tài Chính..." },
                { page: 12, content: "TS002 - Hà Nội, Kho số 2 KCN Thăng Long..." }
            ]
        };
    }

    if (q.includes('1 tỷ') || q.includes('trên 1') || q.includes('>1')) {
        return {
            text: `Có <b>2 tài sản giá trị trên 1 tỷ</b>:<br>
                       1. <b>TS001</b> - ${MOCK_DATA.TS001.gia_tri} - Đặt tại Hà Nội<br>
                       2. <b>TS003</b> - ${MOCK_DATA.TS003.gia_tri} - Đặt tại TP.HCM`,
            sources: [
                { page: 5, content: "TS001 - Nguyên giá: 2,500,000,000 VNĐ..." },
                { page: 18, content: "TS003 - Nguyên giá: 1,200,000,000 VNĐ..." }
            ]
        };
    }

    if (q.includes('liệt kê') || q.includes('tất cả')) {
        return {
            text: `Danh sách <b>tất cả tài sản</b> trong hệ thống:<br>
                       1. <b>TS001</b> - 2.5 tỷ - Hà Nội<br>
                       2. <b>TS002</b> - 850 triệu - Hà Nội<br>
                       3. <b>TS003</b> - 1.2 tỷ - TP.HCM<br>
                       4. <b>TS004</b> - 650 triệu - Đà Nẵng`,
            sources: [
                { page: 5, content: "Danh mục tài sản - Trang 1..." },
                { page: 23, content: "Danh mục tài sản - Trang 2..." }
            ]
        };
    }

    return {
        text: `Tôi không tìm thấy thông tin này trong tài liệu <b>${fileName}</b>. Vui lòng thử với mã tài sản cụ thể như TS001, TS002 hoặc hỏi về địa điểm như Hà Nội, TP.HCM.`,
        sources: []
    };
},

 addUserMsg: function (text) {
    const html = `<div class="msg user"><div class="msg-bubble">${text}</div></div>`;
    $('#chatBox').append(html);
    chatbot.scrollChat();
},

 addBotMsg: function (text, sources = []) {
    let sourceHtml = '';
    if (sources.length > 0) {
        sourceHtml = '<div class="sources"><div class="sources-title">📚 Nguồn trích dẫn:</div>';
        sources.forEach(s => {
            sourceHtml += `<div class="source-item">Trang ${s.page}: ${s.content}</div>`;
        });
        sourceHtml += '</div>';
    }
    const html = `<div class="msg bot"><div class="msg-bubble">${text}${sourceHtml}</div></div>`;
    $('#chatBox').append(html);
     chatbot.scrollChat();
},

 addTypingMsg: function () {
    const id = 'typing-' + Date.now();
    const html = `<div class="msg bot" id="${id}"><div class="msg-bubble">
            <span class="typing"></span><span class="typing"></span><span class="typing"></span>
        </div></div>`;
    $('#chatBox').append(html);
     chatbot.scrollChat();
    return id;
},

 removeTypingMsg: function (id) {
    $(`#${id}`).remove();
},

 scrollChat: function () {
    const box = $('#chatBox');
    box.scrollTop(box[0].scrollHeight);
},

 showFlow: function () {
    $('#flowModal').addClass('show');
},

 closeFlow: function () {
    $('#flowModal').removeClass('show');
}

}