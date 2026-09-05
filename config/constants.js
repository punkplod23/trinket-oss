var config = require('config');

var constants = {
  trinketLangs : [
      'python'
    , 'python3'
    , 'console'
    , 'music'
    , 'html'
    , 'blocks'
    , 'glowscript'
    , 'java'
    , 'go'
    , 'rust'
    , 'glowscript-blocks'
    , 'R'
    , 'pygame'
  ]
};

module.exports = config.constants = constants;
