let isDark = true;
chatbot = {
    // Theme Toggle
    init: function() {

        $('#themeToggle').off('click').on('click', function () {
            isDark = !isDark;
            $('body').attr('data-theme', isDark ? 'dark' : 'light');
            $(this).find('span').html(isDark ?
                '<i class="fas fa-moon"></i> Giao diện tối' :
                '<i class="fas fa-sun"></i> Giao diện sáng');
            $(this).find('.fa-toggle-on').toggleClass('fa-toggle-off', !isDark);
        });

        // Mobile Menu
        $('#mobileMenuBtn').off('click').on('click', function () {
            $('#sidebar').toggleClass('open');

        });
        

        // Module Navigation
        $('.nav-item').off('click').on('click', function () {
            $('.nav-item').removeClass('active');
            $(this).addClass('active');
            const module = $(this).data('module');

            $('.module').removeClass('active');
            $(`#${module}Module`).addClass('active');

            const titles = {
                chat: 'Chat AI Assistant',
                assets: 'Asset Management',
                upload: 'Upload PDF',
                login: 'Login'
            };
            $('#pageTitle').text(titles[module]);

            if ($(window).width() <= 768) {
                $('#sidebar').removeClass('open');
            }
        });


        // Auto-resize textarea
        $('#chatInput').on('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

       
      

        $('#chatInput').off("keydown").on("keydown", function (e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                var question = $(this).val();
                if (question != '') {
                    chatbot.sendMessage(question);
                }
            }
        });

        $('#sendBtn').off('click').on('click', function () {
            var question = $('#chatInput').val();
            chatbot.sendMessage(question)
        });



        // Example prompts
        $('.prompt-card').off('click').on('click', function () {
            const prompt = $(this).data('prompt');
            $('#chatInput').val(prompt).trigger('input');
            chatbot.sendMessage();
        });


    },

    // Send Message Function
   sendMessage: function () {
    const message = $('#chatInput').val().trim();
    if (!message) return;

    $('#welcomeScreen').hide();
    chatbot.addMessage(message, 'user');
    $('#chatInput').val('').trigger('input');

    // Start RAG Pipeline
    chatbot.processRAGPipeline(message);
    },


     addMessage: function(content, role, showPipeline = false) {
    const time = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const avatar = role === 'user' ? 'QT' : '<i class="fas fa-robot"></i>';

    let pipelineHtml = '';
    if (showPipeline) {
        pipelineHtml = `
        <div class="pipeline-container">
          <div class="pipeline-title">
            <i class="fas fa-project-diagram"></i> AI Pipeline Execution
          </div>
          <div class="pipeline-flow" id="pipeline-${Date.now()}">
            <div class="pipeline-step" data-step="user"><i class="fas fa-user"></i> User</div>
            <div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="pipeline-step" data-step="controller"><i class="fas fa-sitemap"></i> AI Controller</div>
            <div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="pipeline-step" data-step="orchestrator"><i class="fas fa-cogs"></i> Orchestrator</div>
            <div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="pipeline-step" data-step="agents"><i class="fas fa-robot"></i> Agents</div>
            <div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="pipeline-step" data-step="db"><i class="fas fa-database"></i> Vector DB/SQL</div>
            <div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="pipeline-step" data-step="context"><i class="fas fa-file-alt"></i> Context</div>
            <div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="pipeline-step" data-step="gpt"><i class="fas fa-brain"></i> GPT-5</div>
            <div class="pipeline-arrow"><i class="fas fa-arrow-right"></i></div>
            <div class="pipeline-step" data-step="answer"><i class="fas fa-check-circle"></i> Answer</div>
          </div>
        </div>
      `;
    }

    const messageHtml = `
      <div class="message ${role}">
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
          <div class="message-bubble">${content}</div>
          ${pipelineHtml}
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;

    $('#chatMessages').append(messageHtml);
    chatbot.scrollToBottom();
    return messageHtml;
    },

    addTypingIndicator: function () {
    const typingHtml = `
      <div class="message assistant" id="typingIndicator">
        <div class="message-avatar"><i class="fas fa-robot"></i></div>
        <div class="message-content">
          <div class="message-bubble">
            <div class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>
      </div>
    `;
    $('#chatMessages').append(typingHtml);
    chatbot.scrollToBottom();
    },

    removeTypingIndicator: function () {
    $('#typingIndicator').remove();
    },
    scrollToBottom: function () {
    const container = $('#chatMessages');
    container.scrollTop(container[0].scrollHeight);
    },

    // RAG Pipeline Simulation
    processRAGPipeline: function (query) {
    // Reset agent panels
    chatbot.resetAgentPanels();
    chatbot.addTypingIndicator();

    // Step 1: User -> Controller
    setTimeout(() => {
        chatbot.updatePipelineStep('user');
        chatbot.updatePipelineStep('controller');
    }, 300);

    // Step 2: Orchestrator
    setTimeout(() => {
        chatbot.updatePipelineStep('orchestrator');
    }, 800);

    // Step 3: Agents - Retriever
    setTimeout(() => {
        chatbot.updatePipelineStep('agents');
        $('#retrieverStatus').addClass('active');

        const retrieverData = chatbot.generateRetrieverData(query);
        $('#retrieverContent').html(`
        <div class="result-item">
          <strong>Vector Search Results:</strong>
          ${retrieverData}
        </div>
        <code>Similarity: 0.89, 0.85, 0.82</code>
      `);
    }, 1500);

    // Step 4: SQL Agent
    setTimeout(() => {
        $('#retrieverStatus').removeClass('active').addClass('completed');
        $('#sqlStatus').addClass('active');

        const sqlQuery = chatbot.generateSQLQuery(query);
        $('#sqlContent').html(`
        <div class="result-item">
          <strong>Generated SQL:</strong>
        </div>
        <code>${sqlQuery}</code>
        <div class="result-item" style="margin-top: 8px;">
          <strong>Rows returned: 15</strong>
        </div>
      `);
    }, 2500);

    // Step 5: Tool Agent
    setTimeout(() => {
        $('#sqlStatus').removeClass('active').addClass('completed');
        $('#toolStatus').addClass('active');

        const toolResult = chatbot.generateToolResult(query);
        $('#toolContent').html(`
        <div class="result-item">
          <strong>Tool: AssetCalculator</strong>
          ${toolResult}
        </div>
      `);
    }, 3500);

    // Step 6: Vector DB / Context
    setTimeout(() => {
        $('#toolStatus').removeClass('active').addClass('completed');
        chatbot.updatePipelineStep('db');
        chatbot.updatePipelineStep('context');
    }, 4500);

    // Step 7: GPT-5 -> Final Answer
    setTimeout(() => {
        chatbot.updatePipelineStep('gpt');
        chatbot.updatePipelineStep('answer');
        chatbot.removeTypingIndicator();

        const response = chatbot.generateFinalResponse(query);
        chatbot.addMessage(response, 'assistant', true);
        setTimeout(() => chatbot.updatePipelineStep('answer', true), 500);
    }, 5500);
    },
    updatePipelineStep: function (step, complete = false) {
    $('.pipeline-step').removeClass('active completed');
    if (complete) {
        $('.pipeline-step').addClass('completed');
    } else {
        $(`.pipeline-step[data-step="${step}"]`).addClass('active');
        $(`.pipeline-step[data-step="${step}"]`).prevAll('.pipeline-step').addClass('completed');
    }
    },



    resetAgentPanels: function () {
    $('.agent-status').removeClass('active completed');
    $('#retrieverContent').html('<p style="color: var(--text-muted); font-size: 12px;">Đang tìm kiếm...</p>');
    $('#sqlContent').html('<p style="color: var(--text-muted); font-size: 12px;">Chuẩn bị truy vấn...</p>');
    $('#toolContent').html('<p style="color: var(--text-muted); font-size: 12px;">Chờ gọi công cụ...</p>');
    },




    // Mock Response Generators
    generateRetrieverData: function (query) {
    const docs = {
        'hao mòn': 'Thông tư 45/2018/TT-BTC về chế độ quản lý, tính hao mòn tài sản cố định<br>Điều 13: Thời gian sử dụng và tỷ lệ hao mòn TSCĐ',
        'điều chuyển': 'Nghị định 151/2017/NĐ-CP về quản lý, sử dụng tài sản công<br>Điều 29: Điều chuyển tài sản công',
        'giá trị': 'Thông tư 144/2017/TT-BTC về khung giá tài sản công'
    };

    for (let key in docs) {
        if (query.toLowerCase().includes(key)) {
            return docs[key];
        }
    }
    return 'Tài liệu liên quan đến quản lý tài sản công tại kho dữ liệu vector';
    },

    generateSQLQuery: function (query) {
    if (query.includes('đơn vị') || query.includes('hao mòn')) {
        return `SELECT dv.ten_don_vi, 
  COUNT(ts.id) as so_ts,
  SUM(ts.nguyen_gia) as tong_gia_tri
FROM tai_san ts
JOIN don_vi dv ON ts.don_vi_id = dv.id
WHERE ts.hao_mon = 0
GROUP BY dv.id
ORDER BY so_ts DESC
LIMIT 10;`;
    }
    return `SELECT * FROM tai_san 
WHERE trang_thai = 'active' 
AND loai_ts_id = 1
LIMIT 20;`;
    },
    generateToolResult: function (query) {
    if (query.includes('giá trị')) {
        return 'Nguyên giá: 1,200,000,000 VNĐ<br>Khấu hao lũy kế: 480,000,000 VNĐ<br><strong>Giá trị còn lại: 720,000,000 VNĐ</strong>';
    }
    return 'Đã tính toán theo Thông tư 45/2018/TT-BTC';
    },

    generateFinalResponse: function (query) {
    if (query.includes('Đơn vị nào còn nhiều tài sản chưa tính hao mòn')) {
        return `<strong>Top 3 đơn vị có nhiều tài sản chưa tính hao mòn:</strong><br><br>
      1. <strong>Sở Giáo dục & Đào tạo</strong>: 127 tài sản, tổng giá trị 15.2 tỷ VNĐ<br>
      2. <strong>UBND Huyện ABC</strong>: 89 tài sản, tổng giá trị 8.7 tỷ VNĐ<br>
      3. <strong>Sở Y tế</strong>: 64 tài sản, tổng giá trị 6.3 tỷ VNĐ<br><br>
      <em>Căn cứ: Thông tư 45/2018/TT-BTC. Các đơn vị cần cập nhật tính hao mòn theo quy định.</em>`;
    }

    if (query.includes('Thông tư nào') && query.includes('điều chuyển')) {
        return `<strong>Văn bản quy định việc điều chuyển tài sản công:</strong><br><br>
      📄 <strong>Nghị định 151/2017/NĐ-CP</strong><br>
      - Điều 29: Điều chuyển tài sản công giữa các cơ quan, tổ chức<br>
      - Điều 30: Thủ tục, hồ sơ điều chuyển<br><br>
      📄 <strong>Thông tư 144/2017/TT-BTC</strong><br>
      - Hướng dẫn chi tiết về định giá tài sản khi điều chuyển<br><br>
      <em>Lưu ý: Điều chuyển phải có quyết định của cấp có thẩm quyền và biên bản bàn giao.</em>`;
    }

    if (query.includes('điều chuyển') && query.includes('giá trị')) {
        return `<strong>Phân tích tài sản điều chuyển:</strong><br><br>
      <strong>1. Quy định áp dụng:</strong><br>
      - Nghị định 151/2017/NĐ-CP, Điều 29: Điều chuyển trong nội bộ tỉnh<br>
      - Thông tư 45/2018/TT-BTC: Tính lại giá trị sau điều chuyển<br><br>
      <strong>2. Giá trị hiện tại:</strong><br>
      - Nguyên giá: 1,200,000,000 VNĐ<br>
      - Đã khấu hao: 40% (480,000,000 VNĐ)<br>
      - <strong>Giá trị còn lại: 720,000,000 VNĐ</strong><br><br>
      <em>Cần lập biên bản xác định giá trị và quyết định điều chuyển từ cơ quan chủ quản.</em>`;
    }

    return `Dựa trên dữ liệu từ hệ thống và các văn bản pháp luật liên quan, tôi đã tổng hợp thông tin để trả lời câu hỏi của bạn. Vui lòng xem chi tiết kết quả từ các Agent ở panel bên phải.`;
}


}
























