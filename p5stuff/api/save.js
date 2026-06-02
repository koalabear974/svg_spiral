'use strict';

module.exports = (_req, res) => {
  res.status(501).json({ error: 'Saving is not available on the hosted version.' });
};
