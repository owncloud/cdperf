import { Endpoint } from './endpoints';

export const PUT__add_tags_to_resource: Endpoint<{ resourceId: string, tagNames: string[] }, 'none'> = (r, {
  tagNames,
  resourceId
}) => {
  return r('PUT', '/graph/v1.0/extensions/org.libregraph/tags', JSON.stringify({
    resourceId,
    tags: tagNames
  }));
};

export const DELETE__remove_tags_from_resource: Endpoint<{
  resourceId: string,
  tagNames: string[]
}, 'none'> = (r, { tagNames, resourceId }) => {
  return r('DELETE', '/graph/v1.0/extensions/org.libregraph/tags', JSON.stringify({
    resourceId,
    tags: tagNames
  }));
};
