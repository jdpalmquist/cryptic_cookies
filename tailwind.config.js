module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
        fontFamily: {
            emilys: ['Emilys Candy', 'cursive'],
            signika:['Signika', 'sans-serif'],
            paytone: ['Paytone One', 'sans-serif'],
        },
        colors: {
            primary: '#6E5F8E',
            secondary: '#92E0FF', //lightest
            tertiary: '#622B40', //darkest
            
        }
    },
  },
  plugins: [],
}
