import 'server-only';
import { cookies } from 'next/headers';

/**
 * Admin UI strings (Traditional Chinese + English). The language is a cookie
 * toggled from the sidebar; the public site uses next-intl instead.
 */
const dict = {
  'zh-Hant': {
    dashboard: '總覽', contacts: '客戶', inbox: '查詢', import: '匯入匯出', bookings: '預約', bookingSetup: '預約設定',
    payments: '收款', products: '產品', team: '團隊', logout: '登出', viewSite: '查看網站',
    contactsTotal: '客戶總數', unhandled: '未處理查詢', upcoming: '即將預約', revenueMonth: '本月收款',
    recentEnquiries: '最新查詢', none: '暫時沒有資料', search: '搜尋', newContact: '新增客戶', name: '姓名', phone: '電話',
    email: '電郵', whatsapp: 'WhatsApp', tags: '標籤', tagsHint: '用逗號分隔', status: '狀態', source: '來源', created: '建立日期',
    save: '儲存', add: '新增', delete: '刪除', cancel: '取消', edit: '編輯', notes: '備註', addNote: '加備註', timeline: '記錄',
    message: '訊息', markHandled: '標記已處理', markOpen: '標記未處理', handled: '已處理', open: '未處理', product: '產品',
    quantity: '數量', formSubmissions: '網站查詢', productInquiries: '產品查詢', upload: '上載 Excel / CSV', uploadHint: '第一行要係欄位名稱。支援 .xlsx 及 .csv，最多 5000 行。',
    mapColumns: '對應欄位', notMapped: '（不匯入）', commit: '確認匯入', exportContacts: '匯出客戶 Excel', rowsOk: '成功', rowsCreated: '新客戶', rowsFailed: '失敗', row: '行',
    week: '星期', prevWeek: '上一週', nextWeek: '下一週', newBooking: '新增預約', service: '服務', staff: '員工', start: '開始時間', contact: '客戶',
    booked: '已預約', done: '已完成', cancelled: '已取消', noShow: '缺席', services: '服務項目', durationMin: '時長（分鐘）', price: '價錢', active: '啟用',
    order: '排序', hours: '工作時間', hoursHint: '每行一段：星期(0=日…6=六) 開始-結束，例如 1 10:00-19:00', timeOff: '休假', from: '由', to: '至', reason: '原因',
    amount: '金額', method: '付款方式', ref: '參考編號', description: '說明', recordPayment: '記錄收款', receipt: '收據', print: '列印', paidAt: '付款日期',
    total: '總數', month: '月份', stripeLinks: 'Stripe 付款連結', createLink: '建立付款連結', copy: '複製', paid: '已付', unpaid: '未付',
    category: '類別', image: '圖片網址', specs: '規格', specsHint: '每行一項：名稱: 內容', nameZhHant: '名稱（繁）', nameZhHans: '名稱（簡）', nameEn: '名稱（英）',
    descZhHant: '描述（繁）', descZhHans: '描述（簡）', descEn: '描述（英）', role: '角色', owner: '擁有人', staffRole: '員工', password: '密碼（最少 10 字）',
    lastLogin: '最後登入', newAdmin: '新增管理員', deactivate: '停用', activate: '啟用', saved: '已儲存', forbidden: '只有擁有人可以使用此功能。',
    lead: '潛在', inactive: '停用', all: '全部', confirmDelete: '確定刪除？', page: '頁', of: '/', signIn: '登入', verify: '驗證', code: '驗證碼',
    codeSent: '驗證碼已寄到你的電郵。', loginTitle: '管理後台', back: '返回', minutes: '分鐘', inquiry: '產品查詢', form: '網站表單', manual: '手動', online: '網上',
    admin: '後台', importSource: '匯入', catalogSource: '產品查詢', bookingSource: '預約', noModule: '此模組未啟用。',
  },
  en: {
    dashboard: 'Dashboard', contacts: 'Contacts', inbox: 'Inbox', import: 'Import / export', bookings: 'Bookings', bookingSetup: 'Booking setup',
    payments: 'Payments', products: 'Products', team: 'Team', logout: 'Log out', viewSite: 'View site',
    contactsTotal: 'Contacts', unhandled: 'Open enquiries', upcoming: 'Upcoming bookings', revenueMonth: 'Revenue this month',
    recentEnquiries: 'Latest enquiries', none: 'Nothing yet', search: 'Search', newContact: 'New contact', name: 'Name', phone: 'Phone',
    email: 'Email', whatsapp: 'WhatsApp', tags: 'Tags', tagsHint: 'Comma separated', status: 'Status', source: 'Source', created: 'Created',
    save: 'Save', add: 'Add', delete: 'Delete', cancel: 'Cancel', edit: 'Edit', notes: 'Notes', addNote: 'Add note', timeline: 'History',
    message: 'Message', markHandled: 'Mark handled', markOpen: 'Mark open', handled: 'Handled', open: 'Open', product: 'Product',
    quantity: 'Quantity', formSubmissions: 'Website enquiries', productInquiries: 'Product enquiries', upload: 'Upload Excel / CSV', uploadHint: 'First row must be column names. .xlsx or .csv, up to 5000 rows.',
    mapColumns: 'Map columns', notMapped: '(skip)', commit: 'Import', exportContacts: 'Export contacts (Excel)', rowsOk: 'Imported', rowsCreated: 'New contacts', rowsFailed: 'Failed', row: 'Row',
    week: 'Week', prevWeek: 'Previous week', nextWeek: 'Next week', newBooking: 'New booking', service: 'Service', staff: 'Staff', start: 'Start', contact: 'Contact',
    booked: 'Booked', done: 'Done', cancelled: 'Cancelled', noShow: 'No-show', services: 'Services', durationMin: 'Duration (min)', price: 'Price', active: 'Active',
    order: 'Order', hours: 'Working hours', hoursHint: 'One per line: weekday(0=Sun…6=Sat) start-end, e.g. 1 10:00-19:00', timeOff: 'Time off', from: 'From', to: 'To', reason: 'Reason',
    amount: 'Amount', method: 'Method', ref: 'Reference', description: 'Description', recordPayment: 'Record payment', receipt: 'Receipt', print: 'Print', paidAt: 'Paid on',
    total: 'Total', month: 'Month', stripeLinks: 'Stripe payment links', createLink: 'Create payment link', copy: 'Copy', paid: 'Paid', unpaid: 'Unpaid',
    category: 'Category', image: 'Image URL', specs: 'Specs', specsHint: 'One per line: Label: value', nameZhHant: 'Name (繁)', nameZhHans: 'Name (简)', nameEn: 'Name (EN)',
    descZhHant: 'Description (繁)', descZhHans: 'Description (简)', descEn: 'Description (EN)', role: 'Role', owner: 'Owner', staffRole: 'Staff', password: 'Password (10+ chars)',
    lastLogin: 'Last login', newAdmin: 'New admin', deactivate: 'Deactivate', activate: 'Activate', saved: 'Saved', forbidden: 'Only the owner can use this.',
    lead: 'Lead', inactive: 'Inactive', all: 'All', confirmDelete: 'Delete this?', page: 'Page', of: 'of', signIn: 'Sign in', verify: 'Verify', code: 'Code',
    codeSent: 'We emailed you a verification code.', loginTitle: 'Admin', back: 'Back', minutes: 'min', inquiry: 'Product enquiry', form: 'Website form', manual: 'Manual', online: 'Online',
    admin: 'Admin', importSource: 'Import', catalogSource: 'Catalog', bookingSource: 'Booking', noModule: 'This module is not enabled.',
  },
} as const;

export type AdminLang = keyof typeof dict;
export type AdminKey = keyof (typeof dict)['zh-Hant'];
export type AdminT = (key: AdminKey) => string;

export async function getAdminLang(): Promise<AdminLang> {
  const v = (await cookies()).get('admin_lang')?.value;
  return v === 'en' ? 'en' : 'zh-Hant';
}

export async function getAdminT(): Promise<AdminT> {
  const lang = await getAdminLang();
  return (key) => dict[lang][key];
}

/** A plain object of strings for passing to client components. */
export async function adminStrings<K extends AdminKey>(keys: K[]): Promise<Record<K, string>> {
  const t = await getAdminT();
  return Object.fromEntries(keys.map((k) => [k, t(k)])) as Record<K, string>;
}
