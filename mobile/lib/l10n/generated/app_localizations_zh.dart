// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get login => '登录';

  @override
  String get register => '注册';

  @override
  String get email => '电子邮箱';

  @override
  String get password => '密码';

  @override
  String get forgotPassword => '忘记密码？';

  @override
  String get dontHaveAccount => '还没有账号？';

  @override
  String get welcomeBack => '欢迎回来';

  @override
  String get loginSubtitle => '登录您的账号以继续';

  @override
  String get createAccount => '创建账号';

  @override
  String get joinUs => '加入我们';

  @override
  String get registerSubtitle => '输入您的详细信息以创建新账号';

  @override
  String get fullName => '姓名';

  @override
  String get confirmPassword => '确认密码';

  @override
  String get resetPassword => '重置密码';

  @override
  String get forgotPasswordTitle => '忘记密码？';

  @override
  String get forgotPasswordSubtitle => '输入您的电子邮箱地址，我们将向您发送重置密码的OTP。';

  @override
  String get sendResetLink => '发送重置链接';

  @override
  String get backToLogin => '返回登录';

  @override
  String get helloThere => '您好！';

  @override
  String get welcomeDashboard => '欢迎回到您的控制面板';

  @override
  String get viewActivity => '查看活动';

  @override
  String get welcomeToast => '欢迎！';

  @override
  String get interactionCounter => '交互计数器';

  @override
  String get addCount => '增加计数';

  @override
  String get homePage => '首页';

  @override
  String get profile => '个人资料';

  @override
  String get alreadyHaveAccount => '已经有账号了？';

  @override
  String get pleaseEnterEmail => '请输入您的电子邮箱';

  @override
  String get pleaseEnterValidEmail => '请输入有效的电子邮箱';

  @override
  String get pleaseEnterPassword => '请输入您的密码';

  @override
  String get passwordTooShort => '密码必须至少为6个字符';

  @override
  String get pleaseEnterName => '请输入您的姓名';

  @override
  String get nameTooShort => '姓名必须至少为2个字符';

  @override
  String get passwordTooShortRegister => '密码必须至少为8个字符';

  @override
  String get passwordsDoNotMatch => '密码不匹配';

  @override
  String get registrationSuccessful => '注册成功！请检查您的电子邮件。';

  @override
  String get resetOtpSent => '如果账号存在，重置OTP已发送。';

  @override
  String get recentActivity => '近期活动';

  @override
  String get activity => '活动';

  @override
  String get activityDescription => '这是发生的事情的描述。';

  @override
  String get otp => '验证码';

  @override
  String get sendOtp => '发送验证码';

  @override
  String get otpSent => '验证码已成功发送';

  @override
  String get pleaseEnterOtp => '请输入验证码';

  @override
  String get oldPassword => '旧密码';

  @override
  String get newPassword => '新密码';

  @override
  String get pleaseEnterOldPassword => '请输入您的旧密码';

  @override
  String get pleaseEnterNewPassword => '请输入您的新密码';

  @override
  String get passwordUpdatedSuccessfully => '密码重置成功';

  @override
  String get chatDemoBanner => '演示聊天 — 消息仅保存在本设备';

  @override
  String get chatMessageHint => '输入消息…';

  @override
  String get chatSend => '发送';

  @override
  String get chatSenderYou => '你';

  @override
  String get profileDemoStatsLabel => '示例数据（非服务器返回）';

  @override
  String get profileProjectsLabel => '项目';

  @override
  String get profileTasksLabel => '任务';

  @override
  String get profileStreakLabel => '连续天数';

  @override
  String get profileAccountSection => '账户';

  @override
  String get profilePreferencesSection => '偏好设置';

  @override
  String get profileEditProfile => '编辑资料';

  @override
  String get profileNotifications => '通知';

  @override
  String get profilePrivacy => '隐私与安全';

  @override
  String get profileHelp => '帮助与支持';

  @override
  String get profileComingSoon => '即将推出';

  @override
  String get profileRoleLabel => '角色';

  @override
  String get profileGuestHint => '无法加载个人资料，请重新登录。';

  @override
  String profileJoined(int year) {
    return '$year 年加入';
  }

  @override
  String get profileDemoDisplayName => '陈雅琳';

  @override
  String get profileDemoJobTitle => '产品设计师';

  @override
  String get profileDemoLocation => '香港';

  @override
  String get profileDemoEmail => 'alex.chen@example.com';

  @override
  String get profileDemoRoleValue => '会员';

  @override
  String get profileSupportSection => '支持';

  @override
  String get profileMenuChangePassword => '密码与登录';

  @override
  String get profileMenuConnectedDevices => '已连接设备';

  @override
  String get profileMenuLanguageRegion => '语言和地区';

  @override
  String get profileMenuAppearance => '显示与亮度';

  @override
  String get profileMenuAccessibility => '无障碍';

  @override
  String get profileMenuPaymentMethods => '支付方式';

  @override
  String get profileMenuDownloadData => '下载你的数据';

  @override
  String get profileMenuTerms => '服务条款';

  @override
  String get profileMenuSendFeedback => '发送反馈';

  @override
  String get contactsDemoBanner => '演示联系人 — 非服务器加载';

  @override
  String get contactsSearchHint => '搜索联系人…';

  @override
  String get contactsEmptyFilter => '没有匹配的联系人';

  @override
  String get drawerNavigationSection => '导航';

  @override
  String get drawerQuickActionsSection => '快捷操作';

  @override
  String get drawerDemoChat => '演示聊天';

  @override
  String get drawerDemoButton => '试用演示聊天';

  @override
  String get drawerLogout => '退出登录';
}

/// The translations for Chinese, as used in Hong Kong (`zh_HK`).
class AppLocalizationsZhHk extends AppLocalizationsZh {
  AppLocalizationsZhHk() : super('zh_HK');

  @override
  String get login => '登錄';

  @override
  String get register => '註冊';

  @override
  String get email => '電子郵箱';

  @override
  String get password => '密碼';

  @override
  String get forgotPassword => '忘記密碼？';

  @override
  String get dontHaveAccount => '還沒有賬號？';

  @override
  String get welcomeBack => '歡迎回來';

  @override
  String get loginSubtitle => '登錄您的賬號以繼續';

  @override
  String get createAccount => '創建賬號';

  @override
  String get joinUs => '加入我們';

  @override
  String get registerSubtitle => '輸入您的詳細信息以創建新賬號';

  @override
  String get fullName => '姓名';

  @override
  String get confirmPassword => '確認密碼';

  @override
  String get resetPassword => '重置密碼';

  @override
  String get forgotPasswordTitle => '忘記密碼？';

  @override
  String get forgotPasswordSubtitle => '輸入您的電子郵箱地址，我們將向您發送重置密碼的OTP。';

  @override
  String get sendResetLink => '發送重置鏈接';

  @override
  String get backToLogin => '返回登錄';

  @override
  String get helloThere => '您好！';

  @override
  String get welcomeDashboard => '歡迎回到您的控制面板';

  @override
  String get viewActivity => '查看活動';

  @override
  String get welcomeToast => '歡迎！';

  @override
  String get interactionCounter => '交互計數器';

  @override
  String get addCount => '增加計數';

  @override
  String get homePage => '首頁';

  @override
  String get profile => '個人資料';

  @override
  String get alreadyHaveAccount => '已經有賬號了？';

  @override
  String get pleaseEnterEmail => '請輸入您的電子郵箱';

  @override
  String get pleaseEnterValidEmail => '請輸入有效的電子郵箱';

  @override
  String get pleaseEnterPassword => '請輸入您的密碼';

  @override
  String get passwordTooShort => '密碼必須至少為6個字符';

  @override
  String get pleaseEnterName => '請輸入您的姓名';

  @override
  String get nameTooShort => '姓名必須至少為2個字符';

  @override
  String get passwordTooShortRegister => '密碼必須至少為8個字符';

  @override
  String get passwordsDoNotMatch => '密碼不匹配';

  @override
  String get registrationSuccessful => '註冊成功！請檢查您的電子郵件。';

  @override
  String get resetOtpSent => '如果賬號存在，重置OTP已發送。';

  @override
  String get recentActivity => '近期活動';

  @override
  String get activity => '活動';

  @override
  String get activityDescription => '這是發生的事情的描述。';

  @override
  String get otp => '驗證碼';

  @override
  String get sendOtp => '發送驗證碼';

  @override
  String get otpSent => '驗證碼已成功發送';

  @override
  String get pleaseEnterOtp => '請輸入驗證碼';

  @override
  String get oldPassword => '舊密碼';

  @override
  String get newPassword => '新密碼';

  @override
  String get pleaseEnterOldPassword => '請輸入您的舊密碼';

  @override
  String get pleaseEnterNewPassword => '請輸入您的新密碼';

  @override
  String get passwordUpdatedSuccessfully => '密碼重置成功';

  @override
  String get chatDemoBanner => '演示聊天 — 訊息只留喺本裝置';

  @override
  String get chatMessageHint => '輸入訊息…';

  @override
  String get chatSend => '發送';

  @override
  String get chatSenderYou => '你';

  @override
  String get profileDemoStatsLabel => '示例數據（非伺服器返回）';

  @override
  String get profileProjectsLabel => '項目';

  @override
  String get profileTasksLabel => '任務';

  @override
  String get profileStreakLabel => '連續天數';

  @override
  String get profileAccountSection => '賬戶';

  @override
  String get profilePreferencesSection => '偏好設定';

  @override
  String get profileEditProfile => '編輯資料';

  @override
  String get profileNotifications => '通知';

  @override
  String get profilePrivacy => '私隱與安全';

  @override
  String get profileHelp => '說明與支援';

  @override
  String get profileComingSoon => '即將推出';

  @override
  String get profileRoleLabel => '角色';

  @override
  String get profileGuestHint => '無法載入個人資料，請重新登入。';

  @override
  String profileJoined(int year) {
    return '$year 年加入';
  }

  @override
  String get profileDemoDisplayName => '陳雅琳';

  @override
  String get profileDemoJobTitle => '產品設計師';

  @override
  String get profileDemoLocation => '香港';

  @override
  String get profileDemoEmail => 'alex.chen@example.com';

  @override
  String get profileDemoRoleValue => '會員';

  @override
  String get profileSupportSection => '支援';

  @override
  String get profileMenuChangePassword => '密碼與登入';

  @override
  String get profileMenuConnectedDevices => '已連接裝置';

  @override
  String get profileMenuLanguageRegion => '語言同地區';

  @override
  String get profileMenuAppearance => '顯示同亮度';

  @override
  String get profileMenuAccessibility => '無障礙';

  @override
  String get profileMenuPaymentMethods => '付款方式';

  @override
  String get profileMenuDownloadData => '下載你嘅資料';

  @override
  String get profileMenuTerms => '服務條款';

  @override
  String get profileMenuSendFeedback => '意見反映';

  @override
  String get contactsDemoBanner => '演示聯絡人 — 唔係伺服器載入';

  @override
  String get contactsSearchHint => '搜尋聯絡人…';

  @override
  String get contactsEmptyFilter => '冇符合嘅聯絡人';

  @override
  String get drawerNavigationSection => '導航';

  @override
  String get drawerQuickActionsSection => '快捷操作';

  @override
  String get drawerDemoChat => '演示聊天';

  @override
  String get drawerDemoButton => '試用演示聊天';

  @override
  String get drawerLogout => '登出';
}
