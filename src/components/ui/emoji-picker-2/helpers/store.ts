function set(key: string, value: any) {
  try {
    window.localStorage[`emoji-mart.${key}`] = JSON.stringify(value);
  } catch (error) {
    // Ignore error
  }
}

function get(key: string): any {
  try {
    const value = window.localStorage[`emoji-mart.${key}`];

    if (value) {
      return JSON.parse(value);
    }
  } catch (error) {
    // Ignore error
  }
}

export default { set, get };

