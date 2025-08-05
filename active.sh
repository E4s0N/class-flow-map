# 1. 注释 module.mjs 中的 validateLicense 调用
sed -i 's#await _package.validateLicense({ key, theme, dir: nuxt.options.rootDir });#\/\/ await _package.validateLicense({ key, theme, dir: nuxt.options.rootDir });#' node_modules/@nuxt/ui-pro/dist/module.mjs

# 替换 validateLicense 方法
UI_PRO_SHARED_DIR="node_modules/@nuxt/ui-pro/dist/shared/" && \
    find $UI_PRO_SHARED_DIR -type f \( -name "*.cjs" -o -name "*.mjs" \) -exec \
      sed -i '/async function validateLicense(opts) {/,/^}/c\async function validateLicense(opts) {\n  const response = {\n    status: 200,\n  };\n  return response;\n}' {} \;
