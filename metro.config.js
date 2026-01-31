const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const exclusionList = (additionalExclusions) => {
    return new RegExp(
        '(' +
        (additionalExclusions || [])
            .map((regexp) => regexp.source)
            .join('|') +
        ')$'
    );
};

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
    resolver: {
        blockList: exclusionList([
            /.*\/android\/app\/\.cxx\/.*/,
            /.*\/android\/app\/build\/.*/,
        ]),
    },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
