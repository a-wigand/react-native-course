// External imports
import React, { FunctionComponent } from 'react';
import { ActivityIndicator, FlatList, Image, Text } from 'react-native';

// Internal imports
import useDummy from 'hooks/useDummy';
import { DummyItemT } from 'store/dummy/types';

/**
 * Dummy screen which displays a list of fetched dummy images
 */
const DummyScreen: FunctionComponent = () => {
  const { data, isLoading, error } = useDummy();

  return isLoading ? (
    <ActivityIndicator />
  ) : error ? (
    <Text>{`Error: ${error}`}</Text>
  ) : (
    <FlatList
      data={data}
      renderItem={({ item }: { item: DummyItemT }) => (
        <Image
          style={imageStyle}
          source={{ uri: item.download_url }}
        />
      )}
      keyExtractor={({ id }) => id}
    />
  );
};

const imageStyle = { width: 300, height: 300 };

export default DummyScreen;
