module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default : {
        src: ["app/**/*.ts", "!app/**/*.spec.ts"]
      }
    },
    mochacli: {
      test: {
        options: {
          compilers: ['ts:ts-node/register', 'tsx:ts-node/register']
        },
        src: ['app/**/*.spec.ts'],
      },
      omg: {
        options: {
          compilers: ['ts:ts-node/register', 'tsx:ts-node/register'],
          inspect: true,
          'debug-brk': true
        },
        src: ['app/**/*.spec.ts'],
      }
    },
    clean: ['app/**/*js', 'app/**/*js.map', 'build/*js', 'build/*js.map']
  });
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.registerTask('test', ['mochacli:test']);
  grunt.registerTask('omg', ['mochacli:omg']);
  grunt.registerTask("default", ["ts"]);
};
