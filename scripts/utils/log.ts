export const log = {
  info: (message: string) => console.log(`ℹ️  ${message}`),
  success: (message: string) => console.log(`✨ ${message}`),
  warning: (message: string) => console.log(`⚠️  ${message}`),
  error: (message: string, error?: unknown) => console.error(`❌ ${message}`, error || ''),
  step: (step: number, total: number, message: string) => {
    console.log(`\n[${step}/${total}] 🔄 ${message}...`);
  },
  divider: () => console.log('\n----------------------------------------\n'),
};
