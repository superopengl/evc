import React from 'react';
import PropTypes from 'prop-types';
import Tag from './Tag';

const TagFilter = (props) => {

  const { onChange, tags, value } = props;
  const [selected, setSelected] = React.useState(value);

  const isSelected = (tag) => {
    return selected.includes(tag.id);
  }

  const toggleSelected = (tag) => {
    let newSelected;
    if (isSelected(tag)) {
      newSelected = [...selected.filter(x => x !== tag.id)];
    } else {
      newSelected = [...selected, tag.id];
    }
    setSelected(newSelected);
    onChange(newSelected);
  }

  return (
      <div style={{padding: '1rem 0'}}>
        {tags.map((t, i) => <Tag
          key={i}
          color={t.color}
          clickable={true}
          style={{marginBottom: 10}}
          checked={isSelected(t)}
          onClick={() => toggleSelected(t)}
        >
          {t.name}
        </Tag>)}
      </div>
  );
};

TagFilter.propTypes = {
  // value: PropTypes.string.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func,
  tags: PropTypes.arrayOf(PropTypes.object),
};

TagFilter.defaultProps = {
  value: [],
  tags: [],
  onChange: () => { }
};

export default TagFilter;
