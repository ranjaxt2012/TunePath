import { StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  // Modal styles
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalSeparator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },

  // Not found styles
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notFoundLink: {
    marginTop: 15,
    paddingVertical: 15,
  },
  notFoundLinkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
});
