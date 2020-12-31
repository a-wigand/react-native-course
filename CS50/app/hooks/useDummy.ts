import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AnyAction, Dispatch } from '@reduxjs/toolkit';

import { RootStateT } from 'store/reduxRoot';
import { DummyT } from 'store/dummy/types';
import { selectDummy } from 'store/dummy/selectors';
import { fetchDummyStart } from 'store/dummy/slice';

/**
 * Dummy hook
 *
 * Example of a custom hook which encapsulates Redux logic.
 *
 * The component which uses this hook will not be aware of Redux and only uses the data as defined in the API here, i.e. the fields `data` and `isLoading`.
 * That being said, Redux could be swapped for any other state management library and the component would not notice.
 */
const useDummy = (): DummyT => {
  const dispatch = useDispatch<Dispatch<AnyAction>>();
  const { data, isLoading, error } = useSelector<RootStateT, DummyT>(
    selectDummy
  );

  useEffect(() => {
    dispatch(fetchDummyStart());
  }, [dispatch]);

  return { data, isLoading, error };
};

export default useDummy;
