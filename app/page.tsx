'use client';

import { useState, useEffect } from 'react';

type LessonRecord = {
  id: string;
  day: string;
  date: string;
  period: string;
  subject: string;
  absent: string;
  content: string;
  comment: string;
  rank: string;
};

export default function Home() {
  const [className, setClassName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('so_dau_bai_class_name');
      if (saved) return saved;
    }
    return '10A1';
  });

  const [lessons, setLessons] = useState<LessonRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('so_dau_bai_records');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [teacherName, setTeacherName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('so_dau_bai_teacher');
      if (saved) return saved;
    }
    return '';
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(true); 
  const [filterMonth, setFilterMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [day, setDay] = useState('Thứ Hai');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('Tiết 1');
  const [subject, setSubject] = useState('Toán');
  const [absent, setAbsent] = useState('');
  const [content, setContent] = useState('');
  const [comment, setComment] = useState('');
  const [rank, setRank] = useState('Tốt (A)');

  useEffect(() => {
    localStorage.setItem('so_dau_bai_class_name', className);
    localStorage.setItem('so_dau_bai_records', JSON.stringify(lessons));
    localStorage.setItem('so_dau_bai_teacher', teacherName);
  }, [className, lessons, teacherName]);

  const handleSaveLesson = () => {
    if (!content) {
      alert('Vui lòng nhập Tên bài / Nội dung!');
      return;
    }

    if (editingId) {
      setLessons(lessons.map(l => l.id === editingId ? {
        ...l, day, date, period, subject, absent: absent || 'Không', content, comment: comment || 'Không', rank
      } : l));
      setEditingId(null);
    } else {
      const newLesson: LessonRecord = {
        id: Date.now().toString(), day, date, period, subject, absent: absent || 'Không', content, comment: comment || 'Không', rank,
      };
      setLessons([newLesson, ...lessons]);
    }

    setAbsent('');
    setContent('');
    setComment('');
  };

  const handleEditClick = (lesson: LessonRecord) => {
    setEditingId(lesson.id);
    setDay(lesson.day);
    setDate(lesson.date);
    setPeriod(lesson.period);
    setSubject(lesson.subject);
    setAbsent(lesson.absent === 'Không' ? '' : lesson.absent);
    setContent(lesson.content);
    setComment(lesson.comment === 'Không' ? '' : lesson.comment);
    setRank(lesson.rank);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setAbsent('');
    setContent('');
    setComment('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tiết này khỏi sổ?')) {
      setLessons(lessons.filter(l => l.id !== id));
      if (editingId === id) handleCancelEdit();
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateString;
  };

  const exportToCsv = () => {
    if (lessons.length === 0) {
      alert('Chưa có dữ liệu để xuất!');
      return;
    }

    let csvContent = `SỔ ĐẦU BÀI - LỚP ${className}\n\n`;
    csvContent += "Thứ,Ngày dạy,Tiết,Môn học,HS nghỉ,Tên bài / Nội dung,Nhận xét,Xếp loại\n";

    lessons.forEach(lesson => {
      const escapeCsv = (text: string) => `"${text.replace(/"/g, '""')}"`;
      const row = [
        escapeCsv(lesson.day), escapeCsv(formatDate(lesson.date)), escapeCsv(lesson.period), escapeCsv(lesson.subject),
        escapeCsv(lesson.absent), escapeCsv(lesson.content), escapeCsv(lesson.comment), escapeCsv(lesson.rank)
      ].join(',');
      csvContent += row + "\n";
    });

    if (teacherName) csvContent += `\n\n\nGiáo viên ký tên\n\n\n${teacherName}\n`;

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `So_dau_bai_Lop_${className}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedLessons = showAll ? lessons : lessons.filter(l => l.date.startsWith(filterMonth));

  return (
    <main style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      
      <style>{`
        @media print {
          body { background-color: white !important; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; }
          table { border: 1px solid #000 !important; }
          th, td { border: 1px solid #000 !important; padding: 8px !important; color: #000 !important; }
          @page { size: A4 landscape; margin: 15mm; }
        }
        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr !important; }
          .action-buttons { flex-direction: column !important; }
          .action-buttons button { width: 100% !important; margin-bottom: 10px; }
          .header-title { font-size: 24px !important; }
          table, thead, tbody, th, td, tr { display: block; }
          thead tr { position: absolute; top: -9999px; left: -9999px; }
          tr { border: 1px solid #ccc; margin-bottom: 15px; border-radius: 8px; background: white; overflow: hidden; }
          td { 
            border: none; border-bottom: 1px solid #eee; position: relative; 
            padding-left: 45% !important; text-align: right; min-height: 40px; 
            display: flex; align-items: center; justify-content: flex-end; padding-top: 10px; padding-bottom: 10px;
          }
          td:before { 
            position: absolute; top: 50%; left: 10px; transform: translateY(-50%); 
            width: 40%; white-space: nowrap; text-align: left; font-weight: bold; color: #555; 
          }
          td:nth-of-type(1):before { content: "Thứ/Ngày:"; }
          td:nth-of-type(2):before { content: "Tiết:"; }
          td:nth-of-type(3):before { content: "Môn học:"; }
          td:nth-of-type(4):before { content: "HS nghỉ:"; }
          td:nth-of-type(5):before { content: "Nội dung:"; }
          td:nth-of-type(6):before { content: "Nhận xét:"; }
          td:nth-of-type(7):before { content: "Xếp loại:"; }
          td:nth-of-type(8):before { content: "Thao tác:"; }
        }
      `}</style>

      <div className="print-container" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        <h1 className="header-title no-print" style={{ fontSize: '28px', color: '#1565c0', marginBottom: '5px' }}>SỔ ĐẦU BÀI SỐ</h1>
        
        <div style={{ display: 'none', textAlign: 'center', marginBottom: '20px' }} id="print-header">
          <h2 style={{ fontSize: '24px', margin: 0 }}>SỔ ĐẦU BÀI - LỚP {className}</h2>
        </div>

        <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: '#666', flexWrap: 'wrap' }}>
          <span>Quản lý tiết học - Lớp:</span>
          <input 
            type="text" value={className} onChange={(e) => setClassName(e.target.value)}
            style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2', border: 'none', borderBottom: '2px dashed #1976d2', backgroundColor: 'transparent', outline: 'none', width: '100px', padding: '2px 5px' }}
          />
        </div>

        <div className="no-print" style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: editingId ? '0 0 0 2px #ff9800' : '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px', transition: 'all 0.3s' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '15px', color: editingId ? '#e65100' : '#333' }}>
            {editingId ? '✏️ Đang sửa tiết học' : '📝 Ghi sổ tiết mới'}
          </h2>
          
          <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Thứ</label>
              <select value={day} onChange={e => setDay(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option>Thứ Hai</option><option>Thứ Ba</option><option>Thứ Tư</option>
                <option>Thứ Năm</option><option>Thứ Sáu</option><option>Thứ Bảy</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Ngày dạy</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tiết</label>
              <select value={period} onChange={e => setPeriod(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option>Tiết 1</option><option>Tiết 2</option><option>Tiết 3</option><option>Tiết 4</option><option>Tiết 5</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Môn học</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Xếp loại</label>
              <select value={rank} onChange={e => setRank(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}>
                <option>Tốt (A)</option><option>Khá (B)</option><option>Trung bình (C)</option><option>Yếu (D)</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tên HS nghỉ tiết (nếu có)</label>
            <input value={absent} onChange={e => setAbsent(e.target.value)} placeholder="VD: Nguyễn Văn A" style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Tên bài / Nội dung công việc (*)</label>
            <input value={content} onChange={e => setContent(e.target.value)} placeholder="VD: Dạy bài 5: Hàm số bậc nhất" style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Nhận xét của giáo viên</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="VD: Lớp hăng hái phát biểu..." style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', height: '60px' }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSaveLesson} style={{ padding: '12px 20px', backgroundColor: editingId ? '#ff9800' : '#1976d2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', flex: 1 }}>
              {editingId ? '💾 Cập nhật' : '+ Ghi vào sổ'}
            </button>
            {editingId && (
              <button onClick={handleCancelEdit} style={{ padding: '12px 20px', backgroundColor: '#9e9e9e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Hủy
              </button>
            )}
          </div>
        </div>

        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', margin: 0, color: '#333' }}>Danh sách tiết học</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Lọc:</label>
            <select
              value={showAll ? 'all' : 'month'}
              onChange={(e) => setShowAll(e.target.value === 'all')}
              style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
            >
              <option value="all">Xem tất cả các tháng</option>
              <option value="month">Chọn tháng cụ thể</option>
            </select>

            {!showAll && (
              <input 
                type="month" 
                value={filterMonth} 
                onChange={(e) => {
                  if (e.target.value) setFilterMonth(e.target.value);
                }} 
                style={{ padding: '7px', borderRadius: '5px', border: '1px solid #ccc' }} 
              />
            )}
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#e3f2fd', color: '#0d47a1', borderBottom: '2px solid #90caf9' }}>
                <th style={{ padding: '12px', borderRight: '1px solid #bbdefb' }}>Thứ / Ngày</th>
                <th style={{ padding: '12px', borderRight: '1px solid #bbdefb' }}>Tiết</th>
                <th style={{ padding: '12px', borderRight: '1px solid #bbdefb' }}>Môn học</th>
                <th style={{ padding: '12px', borderRight: '1px solid #bbdefb' }}>HS nghỉ</th>
                <th style={{ padding: '12px', borderRight: '1px solid #bbdefb', width: '25%' }}>Tên bài / Nội dung</th>
                <th style={{ padding: '12px', borderRight: '1px solid #bbdefb', width: '20%' }}>Nhận xét</th>
                <th style={{ padding: '12px', borderRight: '1px solid #bbdefb' }}>Xếp loại</th>
                <th className="no-print" style={{ padding: '12px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {displayedLessons.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                    {lessons.length === 0 ? 'Chưa có tiết nào được ghi.' : 'Không có tiết nào trong tháng này.'}
                  </td>
                </tr>
              ) : (
                displayedLessons.map((lesson) => (
                  <tr key={lesson.id} style={{ borderBottom: '1px solid #eee', backgroundColor: editingId === lesson.id ? '#fff3e0' : 'transparent' }}>
                    <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>
                      <div style={{ fontWeight: 'bold' }}>{lesson.day}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{formatDate(lesson.date)}</div>
                    </td>
                    <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>{lesson.period}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontWeight: 'bold' }}>{lesson.subject}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #eee', color: lesson.absent !== 'Không' ? '#d32f2f' : '#333' }}>{lesson.absent}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>{lesson.content}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #eee', fontSize: '14px', color: '#555' }}>{lesson.comment}</td>
                    <td style={{ padding: '12px', borderRight: '1px solid #eee' }}>
                      <span style={{ padding: '4px 8px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' }}>
                        {lesson.rank}
                      </span>
                    </td>
                    <td className="no-print" style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleEditClick(lesson)} style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Sửa</button>
                        <button onClick={() => handleDelete(lesson.id)} style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', flexWrap: 'wrap', gap: '20px' }}>
          
          <div style={{ textAlign: 'center', minWidth: '250px', flex: 1 }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Giáo viên ký tên</p>
            <input 
              type="text" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} placeholder="Nhập tên của bạn..."
              style={{ width: '100%', textAlign: 'center', fontSize: '24px', fontFamily: '"Dancing Script", "Comic Sans MS", cursive, sans-serif', border: 'none', borderBottom: '2px dashed #999', outline: 'none', padding: '10px', color: '#0d47a1', backgroundColor: 'transparent' }}
            />
          </div>

          <div className="no-print action-buttons" style={{ display: 'flex', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
            <button onClick={() => window.print()} style={{ padding: '12px 24px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              🖨️ Xuất PDF / In
            </button>
            <button onClick={exportToCsv} style={{ padding: '12px 24px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
              📥 Xuất Excel
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
