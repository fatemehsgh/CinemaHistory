// ========================================================
// CineLog - تنظیمات اتصال ابری (Supabase & Google Auth)
// ========================================================
// با وارد کردن آدرس و کلید پروژه Supabase در این فایل،
// تمام کاربران بدون نیاز به هیچ تنظیمی می‌توانند با اکانت گوگل
// یا ایمیل از هر دستگاهی وارد شوند و اطلاعاتشان در ابر ذخیره بماند.

window.CINELOG_CONFIG = {
  // ۱. آدرس URL پروژه شما در Supabase (از بخش Project Settings > API)
  // مثال: 'https://xyzcompany.supabase.co'
  supabaseUrl: '',

  // ۲. کلید عمومی پروژه (anon public key)
  // مثال: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  supabaseAnonKey: ''
};
